import { db } from "./db";
import { teams, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedIndianTeamData() {
  console.log("Starting Indian team data seeding...");
  
  // Create or update teams with Indian context
  const teamData = [
    {
      name: "Enterprise Sales",
      description: "Works with large enterprises and corporate accounts across India",
      createdBy: 1
    },
    {
      name: "SMB Sales",
      description: "Specializes in small and medium businesses in major Indian cities",
      createdBy: 1
    },
    {
      name: "Government & PSU",
      description: "Handles government and public sector undertakings accounts",
      createdBy: 1
    },
    {
      name: "Healthcare Solutions",
      description: "Specializes in healthcare and pharma industries across India",
      createdBy: 1
    },
    {
      name: "Financial Services",
      description: "Focuses on banks, insurance, and fintech companies",
      createdBy: 1
    },
    {
      name: "Education & EdTech",
      description: "Works with educational institutions and EdTech companies",
      createdBy: 1
    }
  ];
  
  for (const team of teamData) {
    const existingTeam = await db.select().from(teams).where(eq(teams.name, team.name)).limit(1);
    
    if (existingTeam.length === 0) {
      await db.insert(teams).values(team);
      console.log(`Team ${team.name} created`);
    } else {
      await db.update(teams)
        .set({ description: team.description })
        .where(eq(teams.name, team.name));
      console.log(`Team ${team.name} updated`);
    }
  }
  
  // Create or update team managers with Indian names
  const managers = [
    {
      username: "enterprise_mgr",
      password: await hashPassword("manager123"),
      fullName: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      role: "sales_manager",
      teamId: 1,
      managerId: null,
      isActive: true
    },
    {
      username: "smb_mgr",
      password: await hashPassword("manager123"),
      fullName: "Priya Patel",
      email: "priya.patel@example.com",
      role: "sales_manager",
      teamId: 2,
      managerId: null,
      isActive: true
    },
    {
      username: "govt_mgr",
      password: await hashPassword("manager123"),
      fullName: "Arjun Singh",
      email: "arjun.singh@example.com",
      role: "sales_manager",
      teamId: 3,
      managerId: null,
      isActive: true
    },
    {
      username: "health_mgr",
      password: await hashPassword("manager123"),
      fullName: "Meera Reddy",
      email: "meera.reddy@example.com",
      role: "sales_manager",
      teamId: 4,
      managerId: null,
      isActive: true
    },
    {
      username: "finance_mgr",
      password: await hashPassword("manager123"),
      fullName: "Vikram Malhotra",
      email: "vikram.malhotra@example.com",
      role: "sales_manager",
      teamId: 5,
      managerId: null,
      isActive: true
    },
    {
      username: "edu_mgr",
      password: await hashPassword("manager123"),
      fullName: "Ananya Desai",
      email: "ananya.desai@example.com",
      role: "sales_manager",
      teamId: 6,
      managerId: null,
      isActive: true
    }
  ];
  
  for (const manager of managers) {
    const existingUser = await db.select().from(users).where(eq(users.username, manager.username)).limit(1);
    
    if (existingUser.length === 0) {
      await db.insert(users).values(manager);
      console.log(`Manager ${manager.fullName} created`);
    } else {
      await db.update(users)
        .set({ 
          fullName: manager.fullName, 
          email: manager.email,
          teamId: manager.teamId,
          managerId: manager.managerId
        })
        .where(eq(users.username, manager.username));
      console.log(`Manager ${manager.fullName} updated`);
    }
  }
  
  // Get managers' IDs
  const managerRecords = await db.select().from(users).where(eq(users.role, "sales_manager"));
  const managerMap = new Map<number, number>();
  for (const manager of managerRecords) {
    if (manager.teamId) {
      managerMap.set(manager.teamId, manager.id);
    }
  }
  
  // Create or update team members with Indian names
  const teamMembers = [
    // Enterprise Sales Team
    {
      username: "enterprise_exec1",
      password: await hashPassword("sales123"),
      fullName: "Amit Kumar",
      email: "amit.kumar@example.com",
      role: "sales_executive",
      teamId: 1,
      managerId: managerMap.get(1) || null,
      isActive: true
    },
    {
      username: "enterprise_exec2",
      password: await hashPassword("sales123"),
      fullName: "Sunil Gupta",
      email: "sunil.gupta@example.com",
      role: "sales_executive",
      teamId: 1,
      managerId: managerMap.get(1) || null,
      isActive: true
    },
    {
      username: "enterprise_exec3",
      password: await hashPassword("sales123"),
      fullName: "Neha Verma",
      email: "neha.verma@example.com",
      role: "sales_executive",
      teamId: 1,
      managerId: managerMap.get(1) || null,
      isActive: true
    },
    {
      username: "enterprise_exec4",
      password: await hashPassword("sales123"),
      fullName: "Deepak Joshi",
      email: "deepak.joshi@example.com",
      role: "sales_executive",
      teamId: 1,
      managerId: managerMap.get(1) || null,
      isActive: true
    },
    
    // SMB Sales Team
    {
      username: "smb_exec1",
      password: await hashPassword("sales123"),
      fullName: "Riya Agarwal",
      email: "riya.agarwal@example.com",
      role: "sales_executive",
      teamId: 2,
      managerId: managerMap.get(2) || null,
      isActive: true
    },
    {
      username: "smb_exec2",
      password: await hashPassword("sales123"),
      fullName: "Aditya Shah",
      email: "aditya.shah@example.com",
      role: "sales_executive",
      teamId: 2,
      managerId: managerMap.get(2) || null,
      isActive: true
    },
    {
      username: "smb_exec3",
      password: await hashPassword("sales123"),
      fullName: "Pooja Mehta",
      email: "pooja.mehta@example.com",
      role: "sales_executive",
      teamId: 2,
      managerId: managerMap.get(2) || null,
      isActive: true
    },
    {
      username: "smb_exec4",
      password: await hashPassword("sales123"),
      fullName: "Karan Kapoor",
      email: "karan.kapoor@example.com",
      role: "sales_executive",
      teamId: 2,
      managerId: managerMap.get(2) || null,
      isActive: true
    },
    
    // Government & PSU Team
    {
      username: "govt_exec1",
      password: await hashPassword("sales123"),
      fullName: "Sanjay Mohan",
      email: "sanjay.mohan@example.com",
      role: "sales_executive",
      teamId: 3,
      managerId: managerMap.get(3) || null,
      isActive: true
    },
    {
      username: "govt_exec2",
      password: await hashPassword("sales123"),
      fullName: "Alok Prasad",
      email: "alok.prasad@example.com",
      role: "sales_executive",
      teamId: 3,
      managerId: managerMap.get(3) || null,
      isActive: true
    },
    {
      username: "govt_exec3",
      password: await hashPassword("sales123"),
      fullName: "Anjali Sinha",
      email: "anjali.sinha@example.com",
      role: "sales_executive",
      teamId: 3,
      managerId: managerMap.get(3) || null,
      isActive: true
    },
    
    // Healthcare Solutions Team
    {
      username: "health_exec1",
      password: await hashPassword("sales123"),
      fullName: "Vivek Bajaj",
      email: "vivek.bajaj@example.com",
      role: "sales_executive",
      teamId: 4,
      managerId: managerMap.get(4) || null,
      isActive: true
    },
    {
      username: "health_exec2",
      password: await hashPassword("sales123"),
      fullName: "Sneha Roy",
      email: "sneha.roy@example.com",
      role: "sales_executive",
      teamId: 4,
      managerId: managerMap.get(4) || null,
      isActive: true
    },
    {
      username: "health_exec3",
      password: await hashPassword("sales123"),
      fullName: "Rajat Kapoor",
      email: "rajat.kapoor@example.com",
      role: "sales_executive",
      teamId: 4,
      managerId: managerMap.get(4) || null,
      isActive: true
    },
    {
      username: "health_exec4",
      password: await hashPassword("sales123"),
      fullName: "Kavita Iyer",
      email: "kavita.iyer@example.com",
      role: "sales_executive",
      teamId: 4,
      managerId: managerMap.get(4) || null,
      isActive: true
    },
    
    // Financial Services Team
    {
      username: "finance_exec1",
      password: await hashPassword("sales123"),
      fullName: "Prakash Sharma",
      email: "prakash.sharma@example.com",
      role: "sales_executive",
      teamId: 5,
      managerId: managerMap.get(5) || null,
      isActive: true
    },
    {
      username: "finance_exec2",
      password: await hashPassword("sales123"),
      fullName: "Shreya Das",
      email: "shreya.das@example.com",
      role: "sales_executive",
      teamId: 5,
      managerId: managerMap.get(5) || null,
      isActive: true
    },
    {
      username: "finance_exec3",
      password: await hashPassword("sales123"),
      fullName: "Raj Arora",
      email: "raj.arora@example.com",
      role: "sales_executive",
      teamId: 5,
      managerId: managerMap.get(5) || null,
      isActive: true
    },
    {
      username: "finance_exec4",
      password: await hashPassword("sales123"),
      fullName: "Monica Tiwari",
      email: "monica.tiwari@example.com",
      role: "sales_executive",
      teamId: 5,
      managerId: managerMap.get(5) || null,
      isActive: true
    },
    
    // Education & EdTech Team
    {
      username: "edu_exec1",
      password: await hashPassword("sales123"),
      fullName: "Aryan Nair",
      email: "aryan.nair@example.com",
      role: "sales_executive",
      teamId: 6,
      managerId: managerMap.get(6) || null,
      isActive: true
    },
    {
      username: "edu_exec2",
      password: await hashPassword("sales123"),
      fullName: "Ishaan Bose",
      email: "ishaan.bose@example.com",
      role: "sales_executive",
      teamId: 6,
      managerId: managerMap.get(6) || null,
      isActive: true
    },
    {
      username: "edu_exec3",
      password: await hashPassword("sales123"),
      fullName: "Divya Menon",
      email: "divya.menon@example.com",
      role: "sales_executive",
      teamId: 6,
      managerId: managerMap.get(6) || null,
      isActive: true
    },
    {
      username: "edu_exec4",
      password: await hashPassword("sales123"),
      fullName: "Rohan Pillai",
      email: "rohan.pillai@example.com",
      role: "sales_executive",
      teamId: 6,
      managerId: managerMap.get(6) || null,
      isActive: true
    }
  ];
  
  for (const member of teamMembers) {
    const existingUser = await db.select().from(users).where(eq(users.username, member.username)).limit(1);
    
    if (existingUser.length === 0) {
      await db.insert(users).values(member);
      console.log(`Sales executive ${member.fullName} created`);
    } else {
      await db.update(users)
        .set({ 
          fullName: member.fullName, 
          email: member.email,
          teamId: member.teamId,
          managerId: member.managerId
        })
        .where(eq(users.username, member.username));
      console.log(`Sales executive ${member.fullName} updated`);
    }
  }
  
  console.log("Indian team data seeding completed!");
}