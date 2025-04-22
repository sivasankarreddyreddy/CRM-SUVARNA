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

export async function seedHIMSTeamData() {
  console.log("Starting HIMS team data seeding...");
  
  // Create or update teams with HIMS context
  const teamData = [
    {
      name: "Hospital Enterprise",
      description: "Works with large hospital chains and medical centers across India",
      createdBy: 1
    },
    {
      name: "Diagnostic Centers",
      description: "Specializes in diagnostic labs and imaging centers in major Indian cities",
      createdBy: 1
    },
    {
      name: "Government Health",
      description: "Handles government hospitals and public healthcare institutions",
      createdBy: 1
    },
    {
      name: "Specialty Clinics",
      description: "Focuses on specialty clinics and super-specialty healthcare providers",
      createdBy: 1
    },
    {
      name: "Medical Colleges",
      description: "Serves medical colleges and teaching hospitals across India",
      createdBy: 1
    },
    {
      name: "Rural Healthcare",
      description: "Provides solutions for rural hospitals and primary health centers",
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
      username: "hosp_mgr",
      password: await hashPassword("manager123"),
      fullName: "Dr. Rajesh Mehta",
      email: "rajesh.mehta@himsprovider.com",
      role: "sales_manager",
      teamId: 1,
      managerId: null,
      isActive: true
    },
    {
      username: "diag_mgr",
      password: await hashPassword("manager123"),
      fullName: "Dr. Priya Sharma",
      email: "priya.sharma@himsprovider.com",
      role: "sales_manager",
      teamId: 2,
      managerId: null,
      isActive: true
    },
    {
      username: "govt_mgr",
      password: await hashPassword("manager123"),
      fullName: "Dr. Vikram Singh",
      email: "vikram.singh@himsprovider.com",
      role: "sales_manager",
      teamId: 3,
      managerId: null,
      isActive: true
    },
    {
      username: "spec_mgr",
      password: await hashPassword("manager123"),
      fullName: "Dr. Meera Patel",
      email: "meera.patel@himsprovider.com",
      role: "sales_manager",
      teamId: 4,
      managerId: null,
      isActive: true
    },
    {
      username: "medcol_mgr",
      password: await hashPassword("manager123"),
      fullName: "Dr. Anil Kumar",
      email: "anil.kumar@himsprovider.com",
      role: "sales_manager",
      teamId: 5,
      managerId: null,
      isActive: true
    },
    {
      username: "rural_mgr",
      password: await hashPassword("manager123"),
      fullName: "Dr. Sunita Reddy",
      email: "sunita.reddy@himsprovider.com",
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
    // Hospital Enterprise Team
    {
      username: "hosp_exec1",
      password: await hashPassword("sales123"),
      fullName: "Amit Gupta",
      email: "amit.gupta@himsprovider.com",
      role: "sales_executive",
      teamId: 1,
      managerId: managerMap.get(1) || null,
      isActive: true
    },
    {
      username: "hosp_exec2",
      password: await hashPassword("sales123"),
      fullName: "Sanjay Verma",
      email: "sanjay.verma@himsprovider.com",
      role: "sales_executive",
      teamId: 1,
      managerId: managerMap.get(1) || null,
      isActive: true
    },
    {
      username: "hosp_exec3",
      password: await hashPassword("sales123"),
      fullName: "Kavita Joshi",
      email: "kavita.joshi@himsprovider.com",
      role: "sales_executive",
      teamId: 1,
      managerId: managerMap.get(1) || null,
      isActive: true
    },
    {
      username: "hosp_exec4",
      password: await hashPassword("sales123"),
      fullName: "Rahul Malhotra",
      email: "rahul.malhotra@himsprovider.com",
      role: "sales_executive",
      teamId: 1,
      managerId: managerMap.get(1) || null,
      isActive: true
    },
    
    // Diagnostic Centers Team
    {
      username: "diag_exec1",
      password: await hashPassword("sales123"),
      fullName: "Neha Agarwal",
      email: "neha.agarwal@himsprovider.com",
      role: "sales_executive",
      teamId: 2,
      managerId: managerMap.get(2) || null,
      isActive: true
    },
    {
      username: "diag_exec2",
      password: await hashPassword("sales123"),
      fullName: "Vivek Shah",
      email: "vivek.shah@himsprovider.com",
      role: "sales_executive",
      teamId: 2,
      managerId: managerMap.get(2) || null,
      isActive: true
    },
    {
      username: "diag_exec3",
      password: await hashPassword("sales123"),
      fullName: "Riya Kapoor",
      email: "riya.kapoor@himsprovider.com",
      role: "sales_executive",
      teamId: 2,
      managerId: managerMap.get(2) || null,
      isActive: true
    },
    {
      username: "diag_exec4",
      password: await hashPassword("sales123"),
      fullName: "Deepak Sharma",
      email: "deepak.sharma@himsprovider.com",
      role: "sales_executive",
      teamId: 2,
      managerId: managerMap.get(2) || null,
      isActive: true
    },
    
    // Government Health Team
    {
      username: "govt_exec1",
      password: await hashPassword("sales123"),
      fullName: "Suresh Kumar",
      email: "suresh.kumar@himsprovider.com",
      role: "sales_executive",
      teamId: 3,
      managerId: managerMap.get(3) || null,
      isActive: true
    },
    {
      username: "govt_exec2",
      password: await hashPassword("sales123"),
      fullName: "Anita Rao",
      email: "anita.rao@himsprovider.com",
      role: "sales_executive",
      teamId: 3,
      managerId: managerMap.get(3) || null,
      isActive: true
    },
    {
      username: "govt_exec3",
      password: await hashPassword("sales123"),
      fullName: "Rakesh Tiwari",
      email: "rakesh.tiwari@himsprovider.com",
      role: "sales_executive",
      teamId: 3,
      managerId: managerMap.get(3) || null,
      isActive: true
    },
    
    // Specialty Clinics Team
    {
      username: "spec_exec1",
      password: await hashPassword("sales123"),
      fullName: "Divya Menon",
      email: "divya.menon@himsprovider.com",
      role: "sales_executive",
      teamId: 4,
      managerId: managerMap.get(4) || null,
      isActive: true
    },
    {
      username: "spec_exec2",
      password: await hashPassword("sales123"),
      fullName: "Arjun Nair",
      email: "arjun.nair@himsprovider.com",
      role: "sales_executive",
      teamId: 4,
      managerId: managerMap.get(4) || null,
      isActive: true
    },
    {
      username: "spec_exec3",
      password: await hashPassword("sales123"),
      fullName: "Pooja Iyer",
      email: "pooja.iyer@himsprovider.com",
      role: "sales_executive",
      teamId: 4,
      managerId: managerMap.get(4) || null,
      isActive: true
    },
    {
      username: "spec_exec4",
      password: await hashPassword("sales123"),
      fullName: "Karan Bajaj",
      email: "karan.bajaj@himsprovider.com",
      role: "sales_executive",
      teamId: 4,
      managerId: managerMap.get(4) || null,
      isActive: true
    },
    
    // Medical Colleges Team
    {
      username: "medcol_exec1",
      password: await hashPassword("sales123"),
      fullName: "Anjali Bose",
      email: "anjali.bose@himsprovider.com",
      role: "sales_executive",
      teamId: 5,
      managerId: managerMap.get(5) || null,
      isActive: true
    },
    {
      username: "medcol_exec2",
      password: await hashPassword("sales123"),
      fullName: "Rajat Das",
      email: "rajat.das@himsprovider.com",
      role: "sales_executive",
      teamId: 5,
      managerId: managerMap.get(5) || null,
      isActive: true
    },
    {
      username: "medcol_exec3",
      password: await hashPassword("sales123"),
      fullName: "Sneha Roy",
      email: "sneha.roy@himsprovider.com",
      role: "sales_executive",
      teamId: 5,
      managerId: managerMap.get(5) || null,
      isActive: true
    },
    {
      username: "medcol_exec4",
      password: await hashPassword("sales123"),
      fullName: "Vikrant Sen",
      email: "vikrant.sen@himsprovider.com",
      role: "sales_executive",
      teamId: 5,
      managerId: managerMap.get(5) || null,
      isActive: true
    },
    
    // Rural Healthcare Team
    {
      username: "rural_exec1",
      password: await hashPassword("sales123"),
      fullName: "Manish Mohan",
      email: "manish.mohan@himsprovider.com",
      role: "sales_executive",
      teamId: 6,
      managerId: managerMap.get(6) || null,
      isActive: true
    },
    {
      username: "rural_exec2",
      password: await hashPassword("sales123"),
      fullName: "Asha Patil",
      email: "asha.patil@himsprovider.com",
      role: "sales_executive",
      teamId: 6,
      managerId: managerMap.get(6) || null,
      isActive: true
    },
    {
      username: "rural_exec3",
      password: await hashPassword("sales123"),
      fullName: "Sanjay Bhatt",
      email: "sanjay.bhatt@himsprovider.com",
      role: "sales_executive",
      teamId: 6,
      managerId: managerMap.get(6) || null,
      isActive: true
    },
    {
      username: "rural_exec4",
      password: await hashPassword("sales123"),
      fullName: "Nisha Desai",
      email: "nisha.desai@himsprovider.com",
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
  
  console.log("HIMS team data seeding completed!");
}