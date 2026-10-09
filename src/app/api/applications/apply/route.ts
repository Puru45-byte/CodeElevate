import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { fullApplicationSchema } from "@/lib/validations/apply";

export async function POST(request: Request) {
  try {
    const json = await request.json();
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
    const supabaseUser = await createClient();

    let userId: string;
    let isNewUser = false;

    // 1. Check if user is already logged in
    const {
      data: { user: currentUser },
    } = await supabaseUser.auth.getUser();

    if (currentUser) {
      userId = currentUser.id;
    } else {
      // For unauthenticated flow, password is strictly required
      if (!data.password || data.password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters with at least one letter and number." },
          { status: 400 }
        );
      }

      // Check if email already exists in profiles or auth
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, email")
        .eq("email", data.email.trim().toLowerCase())
        .maybeSingle();

      if (existingProfile) {
        return NextResponse.json(
          {
            error: "An account with this email already exists. Please log in to apply.",
            isExistingUser: true,
          },
          { status: 400 }
        );
      }

      // Create new Supabase auth user
      const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();
      const { data: authUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: data.email.trim().toLowerCase(),
          password: data.password,
          email_confirm: true,
          user_metadata: {
            first_name: data.firstName.trim(),
            last_name: data.lastName.trim(),
            full_name: fullName,
            phone: data.phone.trim(),
          },
        });

      if (createError || !authUser.user) {
        // If auth user already exists in auth.users but not in profiles
        if (createError?.message?.toLowerCase().includes("already registered") || createError?.message?.toLowerCase().includes("exists")) {
          return NextResponse.json(
            {
              error: "An account with this email already exists. Please log in to apply.",
              isExistingUser: true,
            },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: createError?.message || "Failed to create user account" },
          { status: 500 }
        );
      }

      userId = authUser.user.id;
      isNewUser = true;
    }

    // 2. Fetch internship details to verify and get title
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

    // 3. Block duplicate active applications: one PENDING or APPROVED application per internship
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

    // 4. Handle Profile Photo Upload if base64 provided
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

    // 4b. Handle Resume PDF Upload if base64 provided
    let resumeUrl = data.resumeUrl || null;
    let resumeFileName = data.resumeFileName || null;
    if (data.resumeBase64 && data.resumeBase64.includes(";base64,")) {
      try {
        const matches = data.resumeBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1].toLowerCase();
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");

          // Server-side validation: PDF only and max 2 MB
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

    // 5. Update / Upsert Profile record
    const profilePayload: Record<string, any> = {
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      gender: data.gender,
      date_of_birth: data.dateOfBirth ? data.dateOfBirth : null,
      phone: data.phone.trim(),
      email: data.email.trim().toLowerCase(),
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
      referral_code: data.referralCode ? data.referralCode.trim() : null,
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

    // Check if profile row exists
    const { data: existingProfileRow } = await supabaseAdmin
      .from("profiles")
      .select("id, student_id")
      .eq("id", userId)
      .maybeSingle();

    if (existingProfileRow) {
      await supabaseAdmin
        .from("profiles")
        .update(profilePayload)
        .eq("id", userId);
    } else {
      // Generate clean student ID if sequence isn't auto-firing
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const studentId = `CE2026${randomSuffix}`;
      profilePayload.id = userId;
      profilePayload.student_id = studentId;

      await supabaseAdmin.from("profiles").insert(profilePayload);
    }

    // 6. Create Application with status PENDING
    const { data: application, error: appError } = await supabaseAdmin
      .from("applications")
      .insert({
        user_id: userId,
        internship_id: data.internshipId,
        start_date: data.startDate,
        end_date: data.endDate,
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

    // 7. Create in-app Notification
    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      title: "Application Submitted",
      message: `Your application for ${internship.title} has been submitted successfully and is currently under review.`,
      link: "/dashboard/applications",
    });

    return NextResponse.json({
      success: true,
      application,
      isNewUser,
      email: isNewUser ? data.email.trim().toLowerCase() : undefined,
      password: isNewUser ? data.password : undefined,
    });
  } catch (err: any) {
    console.error("Apply API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
