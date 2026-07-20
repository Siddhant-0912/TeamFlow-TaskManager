import bcrypt from 'bcryptjs';
import User from '../../models/User';
import Project from '../../models/Project';
import Task from '../../models/Task';

const DEMO_PASSWORD = 'DemoPass123!';

const demoUsers = [
  { name: 'Alex Johnson', email: 'alex.johnson@teamflow.demo', role: 'admin' },
  { name: 'Sarah Kim', email: 'sarah.kim@teamflow.demo', role: 'member' },
  { name: 'Daniel Reed', email: 'daniel.reed@teamflow.demo', role: 'member' },
  { name: 'Emma Brooks', email: 'emma.brooks@teamflow.demo', role: 'member' },
  { name: 'Ryan Carter', email: 'ryan.carter@teamflow.demo', role: 'member' },
  { name: 'Olivia Moore', email: 'olivia.moore@teamflow.demo', role: 'member' },
  { name: 'Maya Patel', email: 'maya.patel@teamflow.demo', role: 'member' },
  { name: 'Noah Williams', email: 'noah.williams@teamflow.demo', role: 'member' },
] as const;

const projectSeeds = [
  {
    title: 'Website Redesign',
    description: 'Refresh the public marketing site with clearer messaging, better conversion paths, and a faster design system.',
    memberIndexes: [0, 1, 2, 3, 6],
    daysAgo: 28,
  },
  {
    title: 'Mobile App Launch',
    description: 'Prepare the iOS and Android launch plan, QA release candidates, and publish store assets.',
    memberIndexes: [0, 2, 4, 5, 7],
    daysAgo: 22,
  },
  {
    title: 'Marketing Campaign',
    description: 'Coordinate a multi-channel campaign across email, landing pages, paid social, and customer stories.',
    memberIndexes: [0, 1, 3, 5, 6],
    daysAgo: 18,
  },
  {
    title: 'CRM Dashboard',
    description: 'Build operational dashboards for pipeline visibility, account health, and sales leadership reporting.',
    memberIndexes: [0, 2, 3, 4, 7],
    daysAgo: 14,
  },
  {
    title: 'Client Onboarding Portal',
    description: 'Create a guided onboarding portal with document collection, kickoff tasks, and stakeholder visibility.',
    memberIndexes: [0, 1, 4, 5, 6],
    daysAgo: 10,
  },
] as const;

const taskSeeds = [
  ['Website Redesign', 'Finalize homepage wireframes', 'Lock the above-the-fold layout and primary CTA structure.', 1, -8, 'done', 'high', 9],
  ['Website Redesign', 'Build responsive navigation', 'Implement desktop and mobile navigation states with accessible menus.', 2, -5, 'done', 'medium', 8],
  ['Website Redesign', 'Audit landing page copy', 'Review all product pages for clarity, tone, and conversion friction.', 3, -2, 'in-progress', 'medium', 7],
  ['Website Redesign', 'Optimize hero imagery', 'Compress images and validate loading performance across breakpoints.', 6, 2, 'in-progress', 'low', 6],
  ['Website Redesign', 'QA contact form tracking', 'Verify form events, attribution tags, and thank-you page analytics.', 1, -1, 'in-progress', 'high', 5],
  ['Website Redesign', 'Publish design token documentation', 'Document color, spacing, and typography decisions for handoff.', 3, 5, 'todo', 'medium', 4],
  ['Website Redesign', 'Fix footer accessibility issues', 'Resolve contrast and keyboard focus issues discovered during QA.', 2, -3, 'todo', 'high', 3],

  ['Mobile App Launch', 'Complete app store screenshots', 'Export final screenshots for all required device sizes.', 5, -6, 'done', 'medium', 9],
  ['Mobile App Launch', 'Run beta crash review', 'Triage crash logs and assign release-blocking issues.', 4, -2, 'in-progress', 'high', 8],
  ['Mobile App Launch', 'Prepare launch checklist', 'Confirm release owners, dates, support docs, and rollback process.', 0, 1, 'in-progress', 'high', 7],
  ['Mobile App Launch', 'Update onboarding carousel', 'Refresh onboarding slides with product positioning and current UI.', 7, 4, 'todo', 'medium', 6],
  ['Mobile App Launch', 'Validate push notification opt-in', 'Test opt-in prompt behavior and notification routing.', 2, -4, 'in-progress', 'medium', 5],
  ['Mobile App Launch', 'Submit Android release candidate', 'Upload the signed build and complete Play Console release notes.', 4, 6, 'todo', 'high', 4],
  ['Mobile App Launch', 'Localize release notes', 'Prepare launch notes for priority regions and customer segments.', 5, 8, 'todo', 'low', 3],

  ['Marketing Campaign', 'Segment customer audience', 'Create lifecycle segments for product-qualified and expansion audiences.', 1, -7, 'done', 'medium', 9],
  ['Marketing Campaign', 'Draft launch email sequence', 'Write announcement, reminder, and follow-up emails.', 3, -1, 'in-progress', 'high', 8],
  ['Marketing Campaign', 'Design paid social creatives', 'Produce ad variants for LinkedIn and retargeting campaigns.', 6, 3, 'in-progress', 'medium', 7],
  ['Marketing Campaign', 'Approve campaign landing page', 'Review copy, analytics, legal notes, and final design.', 0, -2, 'todo', 'high', 6],
  ['Marketing Campaign', 'Create customer quote cards', 'Turn approved customer quotes into campaign visuals.', 5, 5, 'todo', 'low', 5],
  ['Marketing Campaign', 'Schedule launch webinar', 'Confirm speakers, registration page, and calendar automation.', 1, 7, 'todo', 'medium', 4],

  ['CRM Dashboard', 'Map sales KPI definitions', 'Align pipeline, stage velocity, and close-rate definitions with sales ops.', 0, -9, 'done', 'high', 9],
  ['CRM Dashboard', 'Build account health widget', 'Combine usage, renewal date, and support signals into one score.', 2, -1, 'in-progress', 'high', 8],
  ['CRM Dashboard', 'Connect pipeline data source', 'Validate CRM data sync and dedupe opportunity records.', 4, 2, 'in-progress', 'medium', 7],
  ['CRM Dashboard', 'Create executive summary cards', 'Design top-level metrics for leadership review.', 3, 4, 'todo', 'medium', 6],
  ['CRM Dashboard', 'Backfill missing owner fields', 'Clean historical opportunity records with missing account ownership.', 7, -5, 'todo', 'high', 5],
  ['CRM Dashboard', 'QA dashboard permissions', 'Confirm managers only see permitted teams and account views.', 2, 6, 'todo', 'high', 4],

  ['Client Onboarding Portal', 'Define onboarding milestones', 'Map kickoff, setup, training, and launch-readiness steps.', 0, -6, 'done', 'medium', 9],
  ['Client Onboarding Portal', 'Build document upload flow', 'Create secure upload states for contracts and brand assets.', 4, -1, 'in-progress', 'high', 8],
  ['Client Onboarding Portal', 'Write welcome checklist copy', 'Draft customer-friendly task descriptions and success criteria.', 1, 2, 'in-progress', 'medium', 7],
  ['Client Onboarding Portal', 'Add stakeholder visibility panel', 'Show client owners, internal owner, and next milestone.', 6, 5, 'todo', 'medium', 6],
  ['Client Onboarding Portal', 'Create kickoff email template', 'Write reusable email template with portal invitation links.', 5, 7, 'todo', 'low', 5],
  ['Client Onboarding Portal', 'Review portal security notes', 'Confirm file visibility, access expiration, and audit logging.', 7, -3, 'todo', 'high', 4],
] as const;

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

export async function isDatabaseEmpty() {
  const [users, projects, tasks] = await Promise.all([
    User.estimatedDocumentCount(),
    Project.estimatedDocumentCount(),
    Task.estimatedDocumentCount(),
  ]);

  return users === 0 && projects === 0 && tasks === 0;
}

export async function seedDemoData({ reset = false } = {}) {
  if (reset) {
    await Promise.all([Task.deleteMany({}), Project.deleteMany({}), User.deleteMany({})]);
  } else {
    const hasData = !(await isDatabaseEmpty());
    if (hasData) {
      return { seeded: false, reason: 'Database already contains data' };
    }
  }

  const password = await bcrypt.hash(DEMO_PASSWORD, 12);
  const createdUsers = await User.insertMany(
    demoUsers.map((user, index) => ({
      ...user,
      avatarInitials: getInitials(user.name),
      password,
      createdAt: daysAgo(45 - index * 3),
    }))
  );

  const admin = createdUsers[0];
  const createdProjects = await Project.insertMany(
    projectSeeds.map((project) => ({
      title: project.title,
      description: project.description,
      adminId: admin._id,
      members: project.memberIndexes.map((index) => createdUsers[index]._id),
      createdAt: daysAgo(project.daysAgo),
    }))
  );

  const projectByTitle = new Map(createdProjects.map((project) => [project.title, project]));
  await Task.insertMany(
    taskSeeds.map(([projectTitle, title, description, userIndex, dueInDays, status, priority, createdAgo]) => {
      const project = projectByTitle.get(projectTitle);
      if (!project) throw new Error(`Missing seeded project: ${projectTitle}`);

      return {
        title,
        description,
        assignedTo: createdUsers[userIndex]._id,
        dueDate: daysFromNow(dueInDays),
        status,
        priority,
        projectId: project._id,
        createdBy: admin._id,
        createdAt: daysAgo(createdAgo),
      };
    })
  );

  return {
    seeded: true,
    adminId: admin._id.toString(),
    users: createdUsers.length,
    projects: createdProjects.length,
    tasks: taskSeeds.length,
    adminLogin: {
      email: demoUsers[0].email,
      password: DEMO_PASSWORD,
    },
  };
}
