-- ========================================================
-- CodeElevate Database Schema: 005_seed.sql
-- Description: Seed data with 14 published internships, complete Python curriculum,
--              automated course cloner function, and default certificate template.
-- ========================================================

-- ────────────────────────────────────────────────────────
-- 1. DEFAULT CERTIFICATE TEMPLATE
-- ────────────────────────────────────────────────────────
insert into public.certificate_templates (id, name, is_default, config)
values (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Standard Professional Certificate',
  true,
  '{
    "heading": "Certificate of Internship Completion",
    "subheading": "This is to certify that",
    "body_text": "has successfully completed the 1-Month Practical Engineering Internship Program with distinction and demonstrated mastery in practical software deliverables.",
    "organization": "CodeElevate EdTech Platform",
    "signatory_name": "Pushkar Kumar",
    "signatory_title": "Head of Academic Programs & Engineering",
    "logo_url": "/icons/open-book.png",
    "signature_url": "/images/signature.png",
    "primary_color": "#1D4ED8",
    "secondary_color": "#0F172A"
  }'::jsonb
)
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────
-- 2. SEED INTERNSHIPS (14 Programs)
-- ────────────────────────────────────────────────────────
insert into public.internships (
  id,
  slug,
  title,
  short_description,
  description,
  category,
  icon_url,
  thumbnail_url,
  technologies,
  duration_months,
  is_free,
  status
) values
(
  '11111111-1111-1111-1111-111111111101'::uuid,
  'python-developer',
  'Python Developer',
  'Master modern Python programming, automation scripts, OOP architectures, and backend REST APIs.',
  'An intensive 1-month practical internship designed to take you from core Python syntax to production-ready APIs and data processing workflows. Build CLI tools, scrapers, and full-stack Python services.',
  'Development',
  '/icons/python.png',
  '/images/hero.png',
  array['Python 3.x', 'FastAPI', 'PostgreSQL', 'OOP', 'Docker', 'Git'],
  1,
  true,
  'PUBLISHED'
),
(
  '11111111-1111-1111-1111-111111111102'::uuid,
  'java-developer',
  'Java Developer',
  'Build enterprise backend architectures, Spring Boot microservices, and robust REST APIs with Java.',
  'Gain hands-on engineering experience with Java 21, Spring Boot, Hibernate ORM, and enterprise database integrations through practical milestones.',
  'Development',
  '/icons/java.png',
  '/images/hero.png',
  array['Java 21', 'Spring Boot', 'Hibernate', 'Maven', 'PostgreSQL', 'JUnit'],
  1,
  true,
  'PUBLISHED'
),
(
  '11111111-1111-1111-1111-111111111103'::uuid,
  'mern-stack-developer',
  'MERN Stack Developer',
  'Engineer full-stack web applications using MongoDB, Express.js, React, and Node.js.',
  'Design and implement end-to-end web applications with interactive user interfaces, authentication, server-side caching, and MongoDB aggregation pipelines.',
  'Development',
  '/icons/react.png',
  '/images/hero.png',
  array['React', 'Node.js', 'Express', 'MongoDB', 'JWT', 'Tailwind CSS'],
  1,
  true,
  'PUBLISHED'
),
(
  '11111111-1111-1111-1111-111111111104'::uuid,
  'ai-machine-learning',
  'AI / Machine Learning Engineer',
  'Train predictive ML models, fine-tune neural networks, and deploy AI APIs with Python & PyTorch.',
  'Hands-on machine learning curriculum covering exploratory data analysis, supervised learning algorithms, neural network architectures, and LLM integrations.',
  'AI/ML',
  '/icons/ai-brain.png',
  '/images/hero.png',
  array['Python', 'Scikit-Learn', 'PyTorch', 'Pandas', 'OpenAI API', 'HuggingFace'],
  1,
  true,
  'PUBLISHED'
),
(
  '11111111-1111-1111-1111-111111111105'::uuid,
  'cloud-computing',
  'Cloud Computing Specialist',
  'Architect scalable cloud infrastructure on AWS, automate deployments with Terraform, and configure containers.',
  'Learn cloud fundamentals, VPC networking, compute clusters, serverless Lambda functions, IAM security policies, and S3 object storage.',
  'Cloud',
  '/icons/blue-cloud.png',
  '/images/hero.png',
  array['AWS', 'Docker', 'Terraform', 'Kubernetes', 'CI/CD', 'Linux'],
  1,
  true,
  'PUBLISHED'
),
(
  '11111111-1111-1111-1111-111111111106'::uuid,
  'cyber-security',
  'Cyber Security Analyst',
  'Perform vulnerability assessments, network packet audits, penetration tests, and secure code reviews.',
  'Dive into defensive and offensive security principles. Learn OWASP Top 10 mitigation, encryption primitives, incident triage, and secure system hardening.',
  'Cyber Security',
  '/icons/blue-shield.png',
  '/images/hero.png',
  array['Network Security', 'Wireshark', 'OWASP Top 10', 'Linux Security', 'Cryptography'],
  1,
  true,
  'PUBLISHED'
),
(
  '11111111-1111-1111-1111-111111111107'::uuid,
  'web-development',
  'Web Development',
  'Craft modern, responsive, accessible web interfaces using React, Next.js, and Tailwind CSS.',
  'Master component architecture, state management, API data fetching, responsive web design, and SEO optimization.',
  'Development',
  '/icons/react.png',
  '/images/hero.png',
  array['HTML5', 'CSS3', 'JavaScript', 'React', 'Tailwind CSS', 'Next.js'],
  1,
  true,
  'PUBLISHED'
),
(
  '11111111-1111-1111-1111-111111111108'::uuid,
  'full-stack-development',
  'Full Stack Development',
  'Build complete full-stack web applications with Next.js, TypeScript, PostgreSQL, and Supabase.',
  'Comprehensive full stack track encompassing server components, server actions, relational database modeling, and real-time websockets.',
  'Development',
  '/icons/react.png',
  '/images/hero.png',
  array['Next.js', 'TypeScript', 'PostgreSQL', 'Supabase', 'Tailwind CSS', 'Prisma'],
  1,
  true,
  'PUBLISHED'
),
(
  '11111111-1111-1111-1111-111111111109'::uuid,
  'data-science',
  'Data Science Specialist',
  'Extract business insights, conduct statistical modeling, and create dynamic data visualizations.',
  'Analyze large datasets with Pandas and NumPy, build interactive visualization dashboards with Streamlit and Plotly, and implement regression models.',
  'Data',
  '/icons/ai-brain.png',
  '/images/hero.png',
  array['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Streamlit', 'SQL'],
  1,
  true,
  'PUBLISHED'
),
(
  '11111111-1111-1111-1111-111111111110'::uuid,
  'data-analytics',
  'Data Analytics',
  'Transform raw transactional data into actionable business intelligence and KPI dashboards.',
  'Master SQL querying, business metric analysis, Excel data modeling, and PowerBI visualization reporting.',
  'Data',
  '/icons/ai-brain.png',
  '/images/hero.png',
  array['SQL', 'Power BI', 'Excel Modeling', 'Python', 'Tableau', 'Statistics'],
  1,
  true,
  'PUBLISHED'
),
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'devops-engineering',
  'DevOps Engineer',
  'Automate CI/CD pipelines, orchestrate Kubernetes clusters, and monitor production reliability.',
  'Build automated deployment pipelines using GitHub Actions, containerize multi-service applications, and configure Prometheus/Grafana monitoring.',
  'Cloud',
  '/icons/blue-cloud.png',
  '/images/hero.png',
  array['Docker', 'Kubernetes', 'GitHub Actions', 'Terraform', 'Prometheus', 'Grafana'],
  1,
  true,
  'PUBLISHED'
),
(
  '11111111-1111-1111-1111-111111111112'::uuid,
  'ui-ux-design',
  'UI/UX Design',
  'Design modern user flows, interactive wireframes, and design systems in Figma.',
  'Conduct user research, develop intuitive information architectures, create responsive mockups, and build high-fidelity interactive prototypes.',
  'Design',
  '/icons/open-book.png',
  '/images/hero.png',
  array['Figma', 'Wireframing', 'Prototyping', 'Design Systems', 'User Research'],
  1,
  true,
  'PUBLISHED'
),
(
  '11111111-1111-1111-1111-111111111113'::uuid,
  'android-development',
  'Android Development',
  'Build native Android applications with Kotlin, Jetpack Compose, and modern architecture.',
  'Create fluid native Android applications featuring Jetpack Compose UI, Room local database caching, Coroutines, and REST API consumption.',
  'Development',
  '/icons/open-book.png',
  '/images/hero.png',
  array['Kotlin', 'Jetpack Compose', 'Android Studio', 'Coroutines', 'Retrofit', 'Room DB'],
  1,
  true,
  'PUBLISHED'
),
(
  '11111111-1111-1111-1111-111111111114'::uuid,
  'software-testing-qa',
  'Software Testing & QA',
  'Automate end-to-end test suites with Playwright, Selenium, and write comprehensive test plans.',
  'Master QA fundamentals: unit testing, integration tests, E2E browser automation, API testing with Postman, and bug lifecycle reporting.',
  'Development',
  '/icons/open-book.png',
  '/images/hero.png',
  array['Selenium', 'Playwright', 'Jest', 'Postman', 'JUnit', 'CI/CD Testing'],
  1,
  true,
  'PUBLISHED'
)
on conflict (id) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  description = excluded.description,
  category = excluded.category,
  icon_url = excluded.icon_url,
  technologies = excluded.technologies;

-- ────────────────────────────────────────────────────────
-- 3. PYTHON DEVELOPER: 4 MODULES & DETAILED TASKS
-- ────────────────────────────────────────────────────────

-- Clean existing modules/tasks for Python to ensure idempotent re-runs
delete from public.internship_modules where internship_id = '11111111-1111-1111-1111-111111111101'::uuid;

-- Insert 4 Modules
insert into public.internship_modules (id, internship_id, title, description, position)
values
(
  '22222222-2222-2222-2222-222222222101'::uuid,
  '11111111-1111-1111-1111-111111111101'::uuid,
  'Week 1 - Python Basics & Scripting',
  'Core Python fundamentals, variables, control flow, functions, exception handling, and automation scripting.',
  1
),
(
  '22222222-2222-2222-2222-222222222102'::uuid,
  '11111111-1111-1111-1111-111111111101'::uuid,
  'Week 2 - Object-Oriented Programming & Web Scraping',
  'Classes, inheritance, encapsulation, file I/O, web scraping with BeautifulSoup, and markdown report generation.',
  2
),
(
  '22222222-2222-2222-2222-222222222103'::uuid,
  '11111111-1111-1111-1111-111111111101'::uuid,
  'Week 3 - Database & REST APIs with FastAPI',
  'Relational database modeling with SQLite/PostgreSQL, CRUD REST endpoints, Pydantic schemas, and token auth.',
  3
),
(
  '22222222-2222-2222-2222-222222222104'::uuid,
  '11111111-1111-1111-1111-111111111101'::uuid,
  'Week 4 - Capstone Project & Deployment',
  'Full-stack Python capstone application, Docker containerization, cloud deployment, and comprehensive documentation.',
  4
);

-- Insert Python Tasks
insert into public.tasks (
  id,
  internship_id,
  module_id,
  title,
  description,
  requirements,
  deadline_days_after_start,
  position,
  is_required,
  status
) values
-- Module 1 Tasks
(
  '33333333-3333-3333-3333-333333333101'::uuid,
  '11111111-1111-1111-1111-111111111101'::uuid,
  '22222222-2222-2222-2222-222222222101'::uuid,
  'Task 1: Build a Command-Line Calculator',
  'Develop an interactive, robust command-line calculator supporting arithmetic operations with clean modular code and input validation.',
  array[
    'Use Python 3.x with clean function definitions',
    'Take two numerical inputs and an operator from user',
    'Implement robust exception handling for invalid inputs and zero division',
    'Push the project code to a public GitHub repository',
    'Include a detailed README.md with setup and usage instructions'
  ],
  4,
  1,
  true,
  'PUBLISHED'
),
(
  '33333333-3333-3333-3333-333333333102'::uuid,
  '11111111-1111-1111-1111-111111111101'::uuid,
  '22222222-2222-2222-2222-222222222101'::uuid,
  'Task 2: Automated File Organizer Script',
  'Build a Python utility script that scans a directory and automatically categorizes files into subfolders based on file extensions.',
  array[
    'Utilize os and shutil standard library modules',
    'Categorize files into Images, Documents, Videos, and Archives',
    'Generate an execution summary log file after every run',
    'Push the script to your GitHub repository with sample usage screenshots'
  ],
  7,
  2,
  true,
  'PUBLISHED'
),
-- Module 2 Tasks
(
  '33333333-3333-3333-3333-333333333103'::uuid,
  '11111111-1111-1111-1111-111111111101'::uuid,
  '22222222-2222-2222-2222-222222222102'::uuid,
  'Task 3: Object-Oriented Library Management System',
  'Design an OOP system modeling Book, Member, and Library entities with checkout history and JSON/file persistence.',
  array[
    'Implement Book, Member, and Library classes with appropriate encapsulation',
    'Handle checkout and return logic with availability checks',
    'Persist library records into JSON storage',
    'Push clean modular code and README to your GitHub repo'
  ],
  11,
  1,
  true,
  'PUBLISHED'
),
(
  '33333333-3333-3333-3333-333333333104'::uuid,
  '11111111-1111-1111-1111-111111111101'::uuid,
  '22222222-2222-2222-2222-222222222102'::uuid,
  'Task 4: Web Scraper & Markdown Report Generator',
  'Scrape live data from a public website using requests & BeautifulSoup, clean the data, and export an analytical markdown report.',
  array[
    'Extract tabular or article content using BeautifulSoup',
    'Clean strings and parse numerical fields accurately',
    'Format and output a formatted markdown summary report',
    'Push script and sample generated reports to GitHub'
  ],
  14,
  2,
  true,
  'PUBLISHED'
),
-- Module 3 Tasks
(
  '33333333-3333-3333-3333-333333333105'::uuid,
  '11111111-1111-1111-1111-111111111101'::uuid,
  '22222222-2222-2222-2222-222222222103'::uuid,
  'Task 5: CRUD REST API with FastAPI & SQLite',
  'Build a production-grade REST API with FastAPI featuring GET, POST, PUT, DELETE endpoints and SQL database persistence.',
  array[
    'Use FastAPI and Pydantic schemas for request/response validation',
    'Integrate SQLite or PostgreSQL database with SQLAlchemy or raw SQL',
    'Include Swagger API documentation with example request payloads',
    'Push codebase with instructions to run locally via uvicorn'
  ],
  18,
  1,
  true,
  'PUBLISHED'
),
(
  '33333333-3333-3333-3333-333333333106'::uuid,
  '11111111-1111-1111-1111-111111111101'::uuid,
  '22222222-2222-2222-2222-222222222103'::uuid,
  'Task 6: API Authentication & JWT Token Middleware',
  'Secure your FastAPI endpoints with password hashing (bcrypt) and JSON Web Token (JWT) authorization headers.',
  array[
    'Implement user registration and login endpoints with password hashing',
    'Protect private routes using JWT Bearer token dependency',
    'Return proper HTTP 401 and 403 error status codes',
    'Push authentication middleware code to GitHub repository'
  ],
  21,
  2,
  true,
  'PUBLISHED'
),
-- Module 4 Tasks
(
  '33333333-3333-3333-3333-333333333107'::uuid,
  '11111111-1111-1111-1111-111111111101'::uuid,
  '22222222-2222-2222-2222-222222222104'::uuid,
  'Task 7: Full-Stack Python Capstone Dashboard',
  'Create a full-stack dashboard or data application combining backend Python APIs with a frontend interface.',
  array[
    'Build a functional frontend communicating with your Python backend API',
    'Implement interactive data visualization or management workflows',
    'Write unit tests covering core business logic',
    'Push full-stack project repository with comprehensive documentation'
  ],
  25,
  1,
  true,
  'PUBLISHED'
),
(
  '33333333-3333-3333-3333-333333333108'::uuid,
  '11111111-1111-1111-1111-111111111101'::uuid,
  '22222222-2222-2222-2222-222222222104'::uuid,
  'Task 8: Dockerize and Deploy Python Web App',
  'Write a Dockerfile and docker-compose.yml for your Python application, deploy to a cloud platform, and document the live URL.',
  array[
    'Create an optimized multi-stage Dockerfile for Python',
    'Configure environment variables securely via .env file',
    'Deploy container to cloud (Render, Railway, Fly.io, or AWS)',
    'Submit GitHub repo with live deployment URL in the README'
  ],
  28,
  2,
  true,
  'PUBLISHED'
);

-- Add sample resources for Python Task 1
insert into public.task_resources (task_id, module_id, title, type, file_path, position)
values
(
  '33333333-3333-3333-3333-333333333101'::uuid,
  '22222222-2222-2222-2222-222222222101'::uuid,
  'Python Official Documentation: Functions & Errors',
  'LINK',
  'https://docs.python.org/3/tutorial/controlflow.html#defining-functions',
  1
),
(
  '33333333-3333-3333-3333-333333333101'::uuid,
  '22222222-2222-2222-2222-222222222101'::uuid,
  'Git & GitHub Starter Guide for Students',
  'LINK',
  'https://docs.github.com/en/get-started/quickstart/hello-world',
  2
);

-- ────────────────────────────────────────────────────────
-- 4. AUTOMATED COURSE STRUCTURE CLONER FUNCTION
-- ────────────────────────────────────────────────────────
create or replace function public.copy_default_course_structure(p_internship_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course record;
  v_mod1 uuid := gen_random_uuid();
  v_mod2 uuid := gen_random_uuid();
  v_mod3 uuid := gen_random_uuid();
  v_mod4 uuid := gen_random_uuid();
begin
  select * into v_course from public.internships where id = p_internship_id;
  if not found then
    return;
  end if;

  -- Delete existing modules if any
  delete from public.internship_modules where internship_id = p_internship_id;

  -- Create 4 weekly modules
  insert into public.internship_modules (id, internship_id, title, description, position)
  values
    (v_mod1, p_internship_id, 'Week 1 - Foundations & Core Environment Setup', 'Introduction to ' || v_course.title || ' ecosystem, project architecture, tooling, and environment configuration.', 1),
    (v_mod2, p_internship_id, 'Week 2 - Core Development & Component Architecture', 'Deep dive into practical implementation, design patterns, modular architecture, and practical coding deliverables.', 2),
    (v_mod3, p_internship_id, 'Week 3 - Advanced Implementations & Data Workflows', 'Integration with backend storage, API endpoints, testing frameworks, and advanced domain workflows.', 3),
    (v_mod4, p_internship_id, 'Week 4 - Capstone Project, Optimization & Deployment', 'Full end-to-end capstone deliverable, performance tuning, cloud deployment, and final engineering portfolio presentation.', 4);

  -- Create 8 practical milestone tasks
  insert into public.tasks (internship_id, module_id, title, description, requirements, deadline_days_after_start, position, is_required, status)
  values
    -- Week 1
    (p_internship_id, v_mod1, 'Task 1: Environment Setup & Starter Milestone', 'Set up local dev environment, build the initial foundational project, and verify with standard tests.', array['Initialize project repository with standard directory layout', 'Implement foundational module features', 'Push code to public GitHub with comprehensive README setup instructions'], 4, 1, true, 'PUBLISHED'),
    (p_internship_id, v_mod1, 'Task 2: Core Feature Implementation', 'Develop the primary business logic module with error handling and edge case validation.', array['Write clean, modular code implementing specified logic', 'Add unit test coverage for happy and failure paths', 'Push commits to GitHub with clear commit messages'], 7, 2, true, 'PUBLISHED'),
    -- Week 2
    (p_internship_id, v_mod2, 'Task 3: Intermediate Architecture Milestone', 'Refactor and extend system architecture using established industry design patterns.', array['Implement modular components with clean separation of concerns', 'Ensure responsiveness or high-throughput handling', 'Document architecture decisions in repository README'], 11, 1, true, 'PUBLISHED'),
    (p_internship_id, v_mod2, 'Task 4: Data Integration & External APIs', 'Connect system components with structured data sources or external API services.', array['Implement robust data serialization and error handling', 'Handle latency and intermittent connectivity edge cases', 'Push validated implementation to GitHub'], 14, 2, true, 'PUBLISHED'),
    -- Week 3
    (p_internship_id, v_mod3, 'Task 5: Advanced Functional Milestone', 'Build complex domain workflows, state persistence, and administrative controls.', array['Implement secure data persistence and validation', 'Ensure strict type safety and input sanitization', 'Submit GitHub repository with verification steps'], 18, 1, true, 'PUBLISHED'),
    (p_internship_id, v_mod3, 'Task 6: Automated Testing & Validation', 'Write automated test suites verifying regressions, edge cases, and performance metrics.', array['Create automated integration and unit test suites', 'Achieve consistent test execution in CI environment', 'Include test run output in repository documentation'], 21, 2, true, 'PUBLISHED'),
    -- Week 4
    (p_internship_id, v_mod4, 'Task 7: Capstone Comprehensive Deliverable', 'Build a production-ready capstone project showcasing complete mastery of ' || v_course.title || '.', array['Deliver fully functional, polished end-to-end application', 'Include clear architecture diagrams and installation guide', 'Push clean, production-grade repository to GitHub'], 25, 1, true, 'PUBLISHED'),
    (p_internship_id, v_mod4, 'Task 8: Production Deployment & Containerization', 'Package the capstone project into a container or deploy to a public cloud environment.', array['Create configuration for cloud deployment (Docker / Cloud)', 'Deploy live application and verify accessibility', 'Include live link and deployment documentation in README'], 28, 2, true, 'PUBLISHED');

end;
$$;

-- Apply default curriculum structure to all other 13 internships
do $$
declare
  r record;
begin
  for r in select id from public.internships where id != '11111111-1111-1111-1111-111111111101'::uuid loop
    perform public.copy_default_course_structure(r.id);
  end loop;
end $$;

-- ────────────────────────────────────────────────────────
-- 5. ADMIN PROMOTION SNIPPET (Run manually when needed)
-- ────────────────────────────────────────────────────────
-- To promote your account to Admin, run this in Supabase SQL editor:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'pushkarkumar@example.com';
