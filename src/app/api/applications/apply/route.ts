import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { fullApplicationSchema } from "@/lib/validations/apply";

export async function POST(request: Request) {
  try {
    // 1. Require an authenticated session
    const supabaseUser = await createClient();
    const {
      data: { user: currentUser },
    } = await supabaseUser.auth.getUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "You must be logged in to apply. Please create an account or log in first." },
        { status: 401 }
      );
    }

    const userId = currentUser.id;

    // 2. Parse and validate the request body
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = fullApplicationSchema.safeParse(json);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return NextResponse.json(
        { error: firstError || "Invalid form data.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabaseAdmin = createAdminClient();

    // 3. Fetch the profile to get the authoritative name/email
    const { data: profileRecord } = await supabaseAdmin
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", userId)
      .maybeSingle();

    // Use profile values when available; fall back to auth user metadata
    const authMeta = currentUser.user_metadata ?? {};
    const authorFirstName: string =
      profileRecord?.first_name ||
      authMeta.first_name ||
      "";
    const authorLastName: string =
      profileRecord?.last_name ||
      authMeta.last_name ||
      "";
    const authorEmail: string =
      profileRecord?.email ||
      currentUser.email ||
      "";

    // 4. Fetch internship details to verify it exists
    const { data: internship, error: internshipError } = await supabaseAdmin
      .from("internships")
      .select("id, title, slug")
      .eq("id", data.internshipId)
      .maybeSingle();

    if (internshipError || !internship) {
      return NextResponse.json(
        { error: "The selected internship domain does not exist." },
        { status: 404 }
      );
    }

    // 5. Block duplicate active applications
    const { data: existingApp } = await supabaseAdmin
      .from("applications")
      .select("id, status")
      .eq("user_id", userId)
      .eq("internship_id", data.internshipId)
      .in("status", ["PENDING", "APPROVED"])
      .maybeSingle();

    if (existingApp) {
      return NextResponse.json(
        {
          error: `You already have an active application for ${internship.title}.`,
          hasActiveApp: true,
        },
        { status: 400 }
      );
    }

    // 6. Handle Profile Photo Upload if base64 provided
    let photoUrl = data.photoUrl || null;
    if (data.photoBase64 && data.photoBase64.startsWith("data:image")) {
      try {
        const matches = data.photoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");
          const extension = mimeType.split("/")[1] || "png";
          const fileName = `${userId}/avatar-${Date.now()}.${extension}`;

          const { error: uploadError } = await supabaseAdmin.storage
            .from("profile-photos")
            .upload(fileName, buffer, {
              contentType: mimeType,
              upsert: true,
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabaseAdmin.storage
              .from("profile-photos")
              .getPublicUrl(fileName);
            photoUrl = publicUrlData.publicUrl;
          } else {
            console.error("Storage photo upload error:", uploadError);
          }
        }
      } catch (uploadErr) {
        console.error("Error processing photo upload:", uploadErr);
      }
    }

    // 7. Handle Resume PDF Upload if base64 provided
    let resumeUrl = data.resumeUrl || null;
    let resumeFileName = data.resumeFileName || null;
    if (data.resumeBase64 && data.resumeBase64.includes(";base64,")) {
      try {
        const matches = data.resumeBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1].toLowerCase();
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");

          if (mimeType !== "application/pdf" && mimeType !== "application/x-pdf") {
            return NextResponse.json(
              { error: "Invalid resume format. Only PDF files are accepted." },
              { status: 400 }
            );
          }

          if (buffer.length > 2 * 1024 * 1024) {
            return NextResponse.json(
              { error: "Resume file size exceeds the 2 MB limit." },
              { status: 400 }
            );
          }

          const fileName = `${userId}/resume-${Date.now()}.pdf`;
          const { error: uploadError } = await supabaseAdmin.storage
            .from("resumes")
            .upload(fileName, buffer, {
              contentType: "application/pdf",
              upsert: true,
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabaseAdmin.storage
              .from("resumes")
              .getPublicUrl(fileName);
            resumeUrl = publicUrlData.publicUrl;
            resumeFileName = data.resumeFileName || "Student_Resume.pdf";
          } else {
            console.error("Storage resume upload error:", uploadError);
          }
        }
      } catch (uploadErr) {
        console.error("Error processing resume upload:", uploadErr);
      }
    }

    // 8. Update / Upsert Profile record
    // IMPORTANT: first_name, last_name, email come from the session, NOT from the client payload
    const profilePayload: Record<string, any> = {
      first_name: authorFirstName,
      last_name: authorLastName,
      email: authorEmail,
      gender: data.gender,
      date_of_birth: data.dateOfBirth ? data.dateOfBirth : null,
      phone: data.phone.trim(),
      whatsapp: data.whatsapp ? data.whatsapp.trim() : null,
      address: data.address ? data.address.trim() : null,
      city: data.city.trim(),
      state: data.state.trim(),
      country: data.country ? data.country.trim() : "India",
      pincode: data.pincode.trim(),
      college: data.college.trim(),
      degree: data.degree.trim(),
      department: data.department.trim(),
      passout_year: data.passoutYear.trim(),
      role: "student",
      consent_at: new Date().toISOString(),
      consent_version: "October 2026",
      updated_at: new Date().toISOString(),
    };

    if (photoUrl) {
      profilePayload.photo_url = photoUrl;
    }
    if (resumeUrl) {
      profilePayload.resume_url = resumeUrl;
      profilePayload.resume_file_name = resumeFileName;
    }

    const { data: existingProfileRow } = await supabaseAdmin
      .from("profiles")
      .select("id, student_id")
      .eq("id", userId)
      .maybeSingle();

    if (existingProfileRow) {
      await supabaseAdmin.from("profiles").update(profilePayload).eq("id", userId);
    } else {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const studentId = `CE2026${randomSuffix}`;
      profilePayload.id = userId;
      profilePayload.student_id = studentId;
      await supabaseAdmin.from("profiles").insert(profilePayload);
    }

    // 9. Create Application with status PENDING
    // Compute end date: start + 1 month - 1 day
    const [startYear, startMonth, startDay] = data.startDate.split("-").map(Number);
    const startDateObj = new Date(Date.UTC(startYear, startMonth - 1, startDay));
    const endDateObj = new Date(
      Date.UTC(
        startDateObj.getUTCFullYear(),
        startDateObj.getUTCMonth() + 1,
        startDateObj.getUTCDate()
      )
    );
    endDateObj.setUTCDate(endDateObj.getUTCDate() - 1);
    const computedEndDate = endDateObj.toISOString().split("T")[0];

    const { data: application, error: appError } = await supabaseAdmin
      .from("applications")
      .insert({
        user_id: userId,
        internship_id: data.internshipId,
        start_date: data.startDate,
        end_date: computedEndDate,
        mode: data.mode || "Remote",
        type: data.type || "INTERNSHIP",
        status: "PENDING",
        resume_url: resumeUrl,
        resume_file_name: resumeFileName,
      })
      .select()
      .single();

    if (appError) {
      console.error("Application insert error:", appError);
      return NextResponse.json(
        { error: "Failed to create application record. Please try again." },
        { status: 500 }
      );
    }

    // 10. Create in-app Notification
    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      title: "Application Submitted",
      message: `Your application for ${internship.title} has been submitted successfully and is currently under review.`,
      link: "/dashboard/applications",
    });

    return NextResponse.json({ success: true, application });
  } catch (err: any) {
    console.error("Apply API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
