import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedTeamsData() {
  console.log("Starting team data seeding...");
  
  // Get admin user for createdBy fields
  const adminUser = await storage.getUserByUsername("admin");
  if (!adminUser) {
    console.error("Admin user not found, cannot proceed with seeding");
    return;
  }
  
  const adminUserId = adminUser.id;
  
  // Step 1: Create Teams
  const teamData = [
    {
      name: "Enterprise Sales",
      description: "Focused on large enterprise clients with complex needs",
      createdBy: adminUserId
    },
    {
      name: "SMB Sales",
      description: "Specialized in small and medium business solutions",
      createdBy: adminUserId
    },
    {
      name: "Government & Education",
      description: "Public sector and educational institution sales",
      createdBy: adminUserId
    },
    {
      name: "Healthcare Solutions",
      description: "Solutions for healthcare providers and related industries",
      createdBy: adminUserId
    },
    {
      name: "Financial Services",
      description: "Specialized in banking, insurance, and financial institutions",
      createdBy: adminUserId
    }
  ];

  // Create teams
  const createdTeams = [];
  for (const team of teamData) {
    // Check if team already exists
    const existingTeams = await storage.getAllTeams();
    const existingTeam = existingTeams.find(t => t.name === team.name);
    
    if (!existingTeam) {
      const newTeam = await storage.createTeam(team);
      console.log(`Created team: ${newTeam.name}`);
      createdTeams.push(newTeam);
    } else {
      console.log(`Team ${team.name} already exists`);
      createdTeams.push(existingTeam);
    }
  }
  
  // Step 2: Create Sales Managers
  const managerData = [
    {
      username: "enterprise_mgr",
      password: await hashPassword("manager123"),
      fullName: "Jennifer Adams",
      email: "j.adams@example.com",
      role: "sales_manager",
      teamId: createdTeams[0].id
    },
    {
      username: "smb_mgr",
      password: await hashPassword("manager123"),
      fullName: "Michael Chen",
      email: "m.chen@example.com",
      role: "sales_manager",
      teamId: createdTeams[1].id
    },
    {
      username: "govt_mgr",
      password: await hashPassword("manager123"),
      fullName: "Laura Washington",
      email: "l.washington@example.com",
      role: "sales_manager",
      teamId: createdTeams[2].id
    },
    {
      username: "health_mgr",
      password: await hashPassword("manager123"),
      fullName: "Robert Patel",
      email: "r.patel@example.com",
      role: "sales_manager",
      teamId: createdTeams[3].id
    },
    {
      username: "finance_mgr",
      password: await hashPassword("manager123"),
      fullName: "Sarah Goldman",
      email: "s.goldman@example.com",
      role: "sales_manager",
      teamId: createdTeams[4].id
    }
  ];
  
  // Create managers
  const createdManagers = [];
  for (const manager of managerData) {
    const existingUser = await storage.getUserByUsername(manager.username);
    if (!existingUser) {
      const newManager = await storage.createUser(manager);
      console.log(`Created manager: ${newManager.fullName}`);
      createdManagers.push(newManager);
    } else {
      console.log(`Manager ${manager.username} already exists`);
      createdManagers.push(existingUser);
    }
  }
  
  // Step 3: Create Sales Executives and assign to teams and managers
  const salesExecData = [
    // Enterprise Sales Team
    {
      username: "enterprise_exec1",
      password: await hashPassword("sales123"),
      fullName: "David Miller",
      email: "d.miller@example.com",
      role: "sales_executive",
      teamId: createdTeams[0].id,
      managerId: createdManagers[0].id
    },
    {
      username: "enterprise_exec2",
      password: await hashPassword("sales123"),
      fullName: "Emma Rodriguez",
      email: "e.rodriguez@example.com",
      role: "sales_executive",
      teamId: createdTeams[0].id,
      managerId: createdManagers[0].id
    },
    {
      username: "enterprise_exec3",
      password: await hashPassword("sales123"),
      fullName: "James Wilson",
      email: "j.wilson@example.com",
      role: "sales_executive",
      teamId: createdTeams[0].id,
      managerId: createdManagers[0].id
    },
    {
      username: "enterprise_exec4",
      password: await hashPassword("sales123"),
      fullName: "Sophia Lee",
      email: "s.lee@example.com",
      role: "sales_executive",
      teamId: createdTeams[0].id,
      managerId: createdManagers[0].id
    },
    
    // SMB Sales Team
    {
      username: "smb_exec1",
      password: await hashPassword("sales123"),
      fullName: "Nathan Brown",
      email: "n.brown@example.com",
      role: "sales_executive",
      teamId: createdTeams[1].id,
      managerId: createdManagers[1].id
    },
    {
      username: "smb_exec2",
      password: await hashPassword("sales123"),
      fullName: "Olivia Garcia",
      email: "o.garcia@example.com",
      role: "sales_executive",
      teamId: createdTeams[1].id,
      managerId: createdManagers[1].id
    },
    {
      username: "smb_exec3",
      password: await hashPassword("sales123"),
      fullName: "William Martin",
      email: "w.martin@example.com",
      role: "sales_executive",
      teamId: createdTeams[1].id,
      managerId: createdManagers[1].id
    },
    {
      username: "smb_exec4",
      password: await hashPassword("sales123"),
      fullName: "Ava Thompson",
      email: "a.thompson@example.com",
      role: "sales_executive",
      teamId: createdTeams[1].id,
      managerId: createdManagers[1].id
    },
    
    // Government & Education Team
    {
      username: "govt_exec1",
      password: await hashPassword("sales123"),
      fullName: "Benjamin Clark",
      email: "b.clark@example.com",
      role: "sales_executive",
      teamId: createdTeams[2].id,
      managerId: createdManagers[2].id
    },
    {
      username: "govt_exec2",
      password: await hashPassword("sales123"),
      fullName: "Charlotte Lewis",
      email: "c.lewis@example.com",
      role: "sales_executive",
      teamId: createdTeams[2].id,
      managerId: createdManagers[2].id
    },
    {
      username: "govt_exec3",
      password: await hashPassword("sales123"),
      fullName: "Daniel Walker",
      email: "d.walker@example.com",
      role: "sales_executive",
      teamId: createdTeams[2].id,
      managerId: createdManagers[2].id
    },
    
    // Healthcare Team
    {
      username: "health_exec1",
      password: await hashPassword("sales123"),
      fullName: "Grace Anderson",
      email: "g.anderson@example.com",
      role: "sales_executive",
      teamId: createdTeams[3].id,
      managerId: createdManagers[3].id
    },
    {
      username: "health_exec2",
      password: await hashPassword("sales123"),
      fullName: "Henry Davis",
      email: "h.davis@example.com",
      role: "sales_executive",
      teamId: createdTeams[3].id,
      managerId: createdManagers[3].id
    },
    {
      username: "health_exec3",
      password: await hashPassword("sales123"),
      fullName: "Isabella Martinez",
      email: "i.martinez@example.com",
      role: "sales_executive",
      teamId: createdTeams[3].id,
      managerId: createdManagers[3].id
    },
    {
      username: "health_exec4",
      password: await hashPassword("sales123"),
      fullName: "Jack Roberts",
      email: "j.roberts@example.com",
      role: "sales_executive",
      teamId: createdTeams[3].id,
      managerId: createdManagers[3].id
    },
    
    // Financial Services Team
    {
      username: "finance_exec1",
      password: await hashPassword("sales123"),
      fullName: "Katherine Johnson",
      email: "k.johnson@example.com",
      role: "sales_executive",
      teamId: createdTeams[4].id,
      managerId: createdManagers[4].id
    },
    {
      username: "finance_exec2",
      password: await hashPassword("sales123"),
      fullName: "Lucas Wright",
      email: "l.wright@example.com",
      role: "sales_executive",
      teamId: createdTeams[4].id,
      managerId: createdManagers[4].id
    },
    {
      username: "finance_exec3",
      password: await hashPassword("sales123"),
      fullName: "Mia Scott",
      email: "m.scott@example.com",
      role: "sales_executive",
      teamId: createdTeams[4].id,
      managerId: createdManagers[4].id
    },
    {
      username: "finance_exec4",
      password: await hashPassword("sales123"),
      fullName: "Noah King",
      email: "n.king@example.com",
      role: "sales_executive",
      teamId: createdTeams[4].id,
      managerId: createdManagers[4].id
    }
  ];
  
  // Create sales executives
  for (const exec of salesExecData) {
    const existingUser = await storage.getUserByUsername(exec.username);
    if (!existingUser) {
      const newExec = await storage.createUser(exec);
      console.log(`Created sales executive: ${newExec.fullName}`);
    } else {
      console.log(`Sales executive ${exec.username} already exists`);
    }
  }
  
  console.log("Team data seeding completed!");
}