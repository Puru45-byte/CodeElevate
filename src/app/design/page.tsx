"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CourseCard } from "@/components/shared/CourseCard";
import { ApplicationCard } from "@/components/shared/ApplicationCard";
import { CertificateCard } from "@/components/shared/CertificateCard";
import { TaskCard } from "@/components/shared/TaskCard";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { Pagination } from "@/components/shared/Pagination";
import { Internship, Task, Application, Certificate, TaskSubmission } from "@/types/database";
import { toast } from "sonner";
import {
  Sparkles,
  Layers,
  Palette,
  Calendar as CalendarIcon,
  ChevronRight,
  User,
  Settings,
  LogOut,
} from "lucide-react";

export default function DesignSystemPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedFilter, setSelectedFilter] = React.useState("all");
  const [searchValue, setSearchValue] = React.useState("");

  const sampleCourse1: Internship = {
    id: "demo-1",
    slug: "full-stack-web-development",
    title: "Full Stack Web Development",
    category: "Development",
    domain: "Development",
    icon_url: "/icons/react.png",
    icon: "/icons/react.png",
    description: "Master modern React, Next.js, and Node.js with real-world enterprise projects.",
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    duration_months: 1,
    is_free: true,
    status: "PUBLISHED",
    created_at: new Date().toISOString(),
  };

  const sampleCourse2: Internship = {
    id: "demo-2",
    slug: "ai-machine-learning",
    title: "AI & Machine Learning",
    category: "AI/ML",
    domain: "AI/ML",
    icon_url: "/icons/ai-brain.png",
    icon: "/icons/ai-brain.png",
    description: "Build intelligent apps using Python, TensorFlow, LLMs, and computer vision models.",
    technologies: ["Python", "PyTorch", "OpenAI", "Pandas"],
    skills: ["Python", "PyTorch", "OpenAI", "Pandas"],
    duration_months: 1,
    is_free: true,
    status: "PUBLISHED",
    created_at: new Date().toISOString(),
  };

  const sampleCourse3: Internship = {
    id: "demo-3",
    slug: "cloud-devops",
    title: "Cloud & DevOps Architecture",
    category: "Cloud",
    domain: "Cloud",
    icon_url: "/icons/blue-cloud.png",
    icon: "/icons/blue-cloud.png",
    description: "Design fault-tolerant AWS architectures, Docker pipelines, and Kubernetes clusters.",
    technologies: ["AWS", "Docker", "CI/CD", "Terraform"],
    skills: ["AWS", "Docker", "CI/CD", "Terraform"],
    duration_months: 1,
    is_free: true,
    status: "PUBLISHED",
    created_at: new Date().toISOString(),
  };

  const sampleApplication: Application = {
    id: "app-1",
    user_id: "user-1",
    internship_id: "demo-1",
    course_id: "demo-1",
    status: "APPROVED",
    created_at: new Date().toISOString(),
    applied_at: new Date().toISOString(),
    internship: sampleCourse1,
    course: sampleCourse1,
  };

  const sampleCertificate: Certificate = {
    id: "cert-1",
    certificate_number: "CE-COMP-0001/2026",
    url_slug: "CE-COMP-0001-2026",
    enrollment_id: "enr-1",
    user_id: "user-1",
    internship_id: "demo-1",
    student_name: "Pushkar Kumar",
    student_code: "CE20261001",
    course_title: "Full Stack Web Development",
    certificate_type: "Certificate of Completion",
    type: "COMPLETION",
    issued_at: new Date().toISOString(),
    issue_date: new Date().toISOString(),
    duration: "1 Month (Remote)",
    status: "ISSUED",
    organization: "CodeElevate",
    verification_url: "https://codeelevate.dev/verify/CE-COMP-0001-2026",
    created_at: new Date().toISOString(),
  };

  const sampleTask: Task = {
    id: "task-1",
    internship_id: "demo-1",
    position: 1,
    task_number: 1,
    title: "Build Responsive E-Commerce Product Catalog",
    description: "Develop a modern React product catalog with filters, search, state management, and smooth cart drawer transitions.",
    requirements: ["Responsive design across devices", "Search and category filter logic", "Interactive cart drawer"],
    resources: [{ title: "Documentation", file_path: "https://react.dev", url: "https://react.dev" }],
    deadline_days_after_start: 7,
    deadline_days: 7,
    is_required: true,
    status: "PUBLISHED",
    created_at: new Date().toISOString(),
  };

  const sampleSubmission: TaskSubmission = {
    id: "sub-1",
    enrollment_id: "enr-1",
    task_id: "task-1",
    user_id: "user-1",
    github_url: "https://github.com/pushkar/ecommerce-catalog",
    github_repo_url: "https://github.com/pushkar/ecommerce-catalog",
    status: "APPROVED",
    admin_feedback: "Superb execution, clean UI components and smooth transitions!",
    submitted_at: new Date().toISOString(),
    reviewed_at: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="container mx-auto max-w-7xl px-4 space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center sm:text-left border-b pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Design System & Component Library
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            CodeElevate Design System
          </h1>
          <p className="text-slate-600 max-w-2xl text-base sm:text-lg">
            A comprehensive showcase of UI tokens, primitives, shadcn/ui components, and composite platform cards.
          </p>
        </div>

        {/* Color Palette & Tokens */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-navy-900">Color Palette & Typography</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl bg-blue-600 text-white space-y-1 shadow-sm">
              <div className="text-xs opacity-80">Primary 600</div>
              <div className="font-bold">#2563EB</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-700 text-white space-y-1 shadow-sm">
              <div className="text-xs opacity-80">Primary 700</div>
              <div className="font-bold">#1D4ED8</div>
            </div>
            <div className="p-4 rounded-xl bg-navy-900 text-white space-y-1 shadow-sm">
              <div className="text-xs opacity-80">Navy 900</div>
              <div className="font-bold">#0F172A</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-600 text-white space-y-1 shadow-sm">
              <div className="text-xs opacity-80">Success</div>
              <div className="font-bold">#059669</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-500 text-white space-y-1 shadow-sm">
              <div className="text-xs opacity-80">Warning</div>
              <div className="font-bold">#F59E0B</div>
            </div>
            <div className="p-4 rounded-xl bg-rose-600 text-white space-y-1 shadow-sm">
              <div className="text-xs opacity-80">Destructive</div>
              <div className="font-bold">#E11D48</div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-navy-900">Buttons & Badges</h2>
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Button Variants</h3>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="default">Primary Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link Button</Button>
                <Button variant="destructive">Destructive</Button>
                <Button isLoading>Loading State</Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Status Badges</h3>
              <div className="flex flex-wrap gap-3 items-center">
                <StatusBadge status="PENDING" />
                <StatusBadge status="UNDER_REVIEW" />
                <StatusBadge status="APPROVED" />
                <StatusBadge status="REJECTED" />
                <StatusBadge status="ACTIVE" />
                <StatusBadge status="COMPLETED" />
                <StatusBadge status="FREE" />
                <Badge variant="default">Default Badge</Badge>
                <Badge variant="secondary">Secondary Badge</Badge>
                <Badge variant="outline">Outline Badge</Badge>
              </div>
            </div>
          </Card>
        </section>

        {/* Form Controls */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-navy-900">Form Controls & Inputs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="demo-input">Text Input</Label>
                <Input id="demo-input" placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-select">Select Menu</Label>
                <Select>
                  <SelectTrigger id="demo-select">
                    <SelectValue placeholder="Select a domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web-dev">Web Development</SelectItem>
                    <SelectItem value="ai-ml">AI / Machine Learning</SelectItem>
                    <SelectItem value="cloud">Cloud Computing</SelectItem>
                    <SelectItem value="cyber">Cyber Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-textarea">Textarea</Label>
                <Textarea id="demo-textarea" placeholder="Provide details about your project..." />
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <div className="space-y-3">
                <Label>Selection Controls</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" defaultChecked />
                  <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Accept terms and conditions
                  </label>
                </div>
                <div className="pt-2">
                  <RadioGroup defaultValue="card">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="r1" />
                      <Label htmlFor="r1">Online Payment (Razorpay)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upi" id="r2" />
                      <Label htmlFor="r2">UPI / QR Code</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Interactive Toast Notification</Label>
                <div>
                  <Button
                    onClick={() => toast.success("Changes saved successfully!", { description: "Your profile has been updated." })}
                    variant="outline"
                  >
                    Trigger Sonner Toast
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Dialogs, Sheets, Popovers */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-navy-900">Overlays & Menus</h2>
          <Card className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Dialog Modal</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Action</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to proceed with this operation?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Slide Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>Explore platform sections</SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-4">
                    <p className="text-sm text-slate-600">Sheet drawer content renders here.</p>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Dropdown Menu <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="w-4 h-4 mr-2" /> Select Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} />
                </PopoverContent>
              </Popover>
            </div>
          </Card>
        </section>

        {/* Data Display & Tables */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-navy-900">Data Display & Progress</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-navy-900">Progress & Avatars</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Internship Completion</span>
                  <span className="font-bold text-primary">65%</span>
                </div>
                <Progress value={65} />
              </div>
              <div className="flex items-center gap-4 pt-4">
                <Avatar>
                  <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" />
                  <AvatarFallback>PK</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-navy-900">Pushkar Kumar</div>
                  <div className="text-xs text-slate-500">Student & Developer</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-navy-900">Skeletons (Loading States)</h3>
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </Card>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold text-navy-900">Full Stack Web Development</TableCell>
                  <TableCell>1 Month</TableCell>
                  <TableCell>3 / 4 Completed</TableCell>
                  <TableCell><StatusBadge status="APPROVED" /></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost">View</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-navy-900">Python Data Science & AI</TableCell>
                  <TableCell>1 Month</TableCell>
                  <TableCell>1 / 5 Completed</TableCell>
                  <TableCell><StatusBadge status="UNDER_REVIEW" /></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost">View</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* Platform Composite Cards */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-navy-900">Platform Domain & Task Cards</h2>
          </div>

          {/* Filter & Search Bar Showcase */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search internships by domain, tech..."
              className="max-w-md w-full"
            />
            <FilterBar
              options={[
                { label: "All Domains", value: "all" },
                { label: "Development", value: "Development" },
                { label: "AI/ML", value: "AI/ML" },
                { label: "Cloud", value: "Cloud" },
              ]}
              selected={selectedFilter}
              onChange={setSelectedFilter}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <CourseCard
              course={sampleCourse1}
              onApplyClick={() => toast.info("Opening application modal...")}
            />

            <CourseCard
              course={sampleCourse2}
              onApplyClick={() => toast.info("Opening application modal...")}
            />

            <CourseCard
              course={sampleCourse3}
              onApplyClick={() => toast.info("Opening application modal...")}
            />
          </div>

          {/* Application & Certificate Card Examples */}
          <div className="grid md:grid-cols-2 gap-6 pt-4">
            <ApplicationCard application={sampleApplication} />

            <CertificateCard certificate={sampleCertificate} />
          </div>

          {/* Task Card Example */}
          <div className="pt-4">
            <TaskCard
              task={sampleTask}
              enrollmentId="enr-1"
              submission={sampleSubmission}
            />
          </div>

          {/* Pagination */}
          <div className="pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={5}
              onPageChange={setCurrentPage}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
