import { db } from "./db";
import { users, teams, type InsertUser, type InsertTeam } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedHealthcareTeams() {
  console.log("Seeding healthcare teams and users...");

  // First, create the teams
  const teamsList = [
    {
      name: "Diagnostic Centers",
      description: "Team focused on diagnostic centers like pathology labs, radiology centers, and diagnostic chains"
    },
    {
      name: "Government Health",
      description: "Team handling government hospitals, primary health centers, and public health initiatives"
    },
    {
      name: "Hospital Enterprise",
      description: "Team for large hospital chains, corporate hospitals, and multi-specialty hospitals"
    },
    {
      name: "Medical Colleges",
      description: "Team focused on medical colleges, teaching hospitals, and research institutions"
    },
    {
      name: "Rural Healthcare",
      description: "Team for rural hospitals, community health centers, and mobile clinics"
    },
    {
      name: "Specialty Clinics",
      description: "Team handling specialty clinics, dental clinics, eye hospitals, and niche healthcare providers"
    }
  ];

  // Create all teams first
  const createdTeams: { id: number; name: string }[] = [];
  for (const teamData of teamsList) {
    // Check if team already exists
    const existingTeam = await db.select().from(teams).where(eq(teams.name, teamData.name)).execute();
    
    if (existingTeam.length === 0) {
      // Insert the team
      const insertData: InsertTeam = {
        name: teamData.name,
        description: teamData.description,
        createdAt: new Date()
      };
      
      const [newTeam] = await db.insert(teams).values(insertData).returning({ id: teams.id, name: teams.name });
      createdTeams.push(newTeam);
      console.log(`Created team: ${newTeam.name}`);
    } else {
      createdTeams.push(existingTeam[0]);
      console.log(`Team already exists: ${existingTeam[0].name}`);
    }
  }

  // Create managers for each team
  const managers: { id: number; teamId: number; username: string }[] = [];
  for (const team of createdTeams) {
    const managerUsername = `${team.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_manager`;
    
    // Check if manager already exists
    const existingManager = await db.select().from(users).where(eq(users.username, managerUsername)).execute();
    
    if (existingManager.length === 0) {
      // Create manager
      const managerData: InsertUser = {
        username: managerUsername,
        password: await hashPassword("Manager@123"),
        fullName: `${team.name} Manager`,
        email: `${managerUsername}@suvarna.co.in`,
        role: "sales_manager",
        teamId: team.id,
        isActive: true,
        createdAt: new Date()
      };
      
      const [newManager] = await db.insert(users).values(managerData).returning({ id: users.id, teamId: users.teamId, username: users.username });
      managers.push(newManager);
      console.log(`Created manager: ${managerUsername}`);
    } else {
      managers.push(existingManager[0]);
      console.log(`Manager already exists: ${existingManager[0].username}`);
    }
  }

  // Update managers to have themselves as their managers (for permissions)
  for (const manager of managers) {
    await db.update(users)
      .set({ managerId: manager.id })
      .where(users => users.id.equals(manager.id))
      .execute();
    console.log(`Updated manager ${manager.username} to have self as manager`);
  }

  // Create team members for each team
  for (const manager of managers) {
    const team = createdTeams.find(t => t.id === manager.teamId);
    if (!team) continue;
    
    // Create 3 executives per team
    for (let i = 1; i <= 3; i++) {
      const execUsername = `${team.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_exec${i}`;
      
      // Check if exec already exists
      const existingExec = await db.select().from(users).where(users => users.username.equals(execUsername)).execute();
      
      if (existingExec.length === 0) {
        // Create exec
        const execData: InsertUser = {
          username: execUsername,
          password: await hashPassword("Exec@123"),
          fullName: `${team.name} Executive ${i}`,
          email: `${execUsername}@suvarna.co.in`,
          role: "sales_executive",
          teamId: team.id,
          managerId: manager.id,
          isActive: true,
          createdAt: new Date()
        };
        
        const [newExec] = await db.insert(users).values(execData).returning({ id: users.id, username: users.username });
        console.log(`Created executive: ${newExec.username}`);
      } else {
        console.log(`Executive already exists: ${existingExec[0].username}`);
      }
    }
  }

  console.log("Healthcare teams and users seeding completed!");
}