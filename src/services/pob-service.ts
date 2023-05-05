import { singleton } from "tsyringe";
import PostgresService from "./mongo/postgres-service";
import { Logger } from "./logger";
import { spawn } from "child_process";
import * as readline from "readline";
import { type PoeApiCharacter } from "@gql/resolvers-types";
import fs from "fs";
import zlib from "zlib";
import DiscordService from "./discord-service";
import { nanoid } from "nanoid";

@singleton()
export default class PobService {
  classMapp = {
    Scion: 0,
    Ascendant: 0,

    Marauder: 1,
    Juggernaut: 1,
    Berserker: 1,
    Chieftain: 1,

    Ranger: 2,
    Raider: 2,
    Deadeye: 2,
    Pathfinder: 2,

    Witch: 3,
    Occultist: 3,
    Elementalist: 3,
    Necromancer: 3,

    Duelist: 4,
    Slayer: 4,
    Gladiator: 4,
    Champion: 4,

    Templar: 5,
    Inquisitor: 5,
    Hierophant: 5,
    Guardian: 5,

    Shadow: 6,
    Assassin: 6,
    Trickster: 6,
    Saboteur: 6,
  };

  aClassMapp = {
    Ascendant: 1,

    Juggernaut: 1,
    Berserker: 2,
    Chieftain: 3,

    Raider: 1,
    Deadeye: 2,
    Pathfinder: 3,

    Occultist: 1,
    Elementalist: 2,
    Necromancer: 3,

    Slayer: 1,
    Gladiator: 2,
    Champion: 3,

    Inquisitor: 1,
    Hierophant: 2,
    Guardian: 3,

    Assassin: 1,
    Trickster: 2,
    Saboteur: 3,
  };

  pobPath = "pob";
  pobQueue: string[] = [];

  constructor(
    private readonly postgresService: PostgresService,
    private readonly discord: DiscordService
  ) {}

  public async startPobStream() {
    let killed = false;
    const writeCount = 0;
    for (;;) {
      try {
        const pob = spawn(
          `export LUA_PATH="../runtime/lua/?.lua;../runtime/lua/?/init.lua;;" && cd ${this.pobPath}/src && luajit HeadlessWrapper.lua`,
          [],
          { shell: true, detached: true }
        );
        this.discord.ping("POB started");
        killed = false;

        pob.stderr.on("data", (data) => {
          Logger.info(`stderr: ${data}`);
          this.discord.ping(`stderr in POB ${data}`);
        });

        pob.on("error", (error) => {
          killed = true;
          Logger.info(`error: ${error?.message}`);
          this.discord.ping(`error in POB ${error?.message}`);
        });

        const rl = readline.createInterface({
          input: pob.stdout,
          crlfDelay: Infinity,
        });
        rl.on("line", (line: string) => {
          Logger.debug(`pob line: ${line}`);
        });

        pob.on("close", (code) => {
          killed = true;
          this.discord.ping("POB closed");
          Logger.info(`child process exited with code ${code}`);
        });

        while (!killed) {
          if (this.pobQueue.length > 0) {
            const jobId = this.pobQueue.shift();
            const x = pob.stdin.write(`${jobId}\n`);
            Logger.info("starting job: " + jobId + " " + x);
          }
          await new Promise((res) => setTimeout(res, 100));
        }
      } catch (error) {
        Logger.error("Error in pob stream", error);
      }
    }
  }

  public async handle(characterData: PoeApiCharacter): Promise<any> {
    let resp;
    const jobId = nanoid();

    const passivesPath = `${this.pobPath}/data/${jobId}_passives.json`;
    fs.writeFileSync(
      passivesPath,
      JSON.stringify({
        hashes: characterData.passives.hashes,
        hashes_ex: characterData.passives.hashes_ex,
        mastery_effects: characterData.passives["mastery_effects"],
        jewel_data: characterData.passives["jewel_data"],
        items: characterData.jewels,
      })
    );

    const itemsPath = `${this.pobPath}/data/${jobId}_items.json`;
    fs.writeFileSync(
      itemsPath,
      JSON.stringify({
        items: characterData.equipment,
        character: {
          name: characterData.name,
          league: characterData.league,
          class: characterData.class,
          level: characterData.level,
          experience: characterData.experience,
          classId: this.classMapp[characterData.class],
          ascendancyClass: this.aClassMapp[characterData.class] ?? 0,
        },
      })
    );

    this.pobQueue.push(jobId);

    const codeFilePath = `${this.pobPath}/data/${jobId}_code.xml`;
    const maintableFilePath = `${this.pobPath}/data/${jobId}_maintable.txt`;
    const completeFilePath = `${this.pobPath}/data/${jobId}_complete.txt`;

    let attempt = 0;
    while (attempt < 100 && !fs.existsSync(completeFilePath)) {
      Logger.debug("waiting for pob");
      await new Promise((res) => setTimeout(res, 100));
      attempt++;
    }

    if (fs.existsSync(codeFilePath) && fs.existsSync(maintableFilePath)) {
      resp = {};
      fs.readFileSync(maintableFilePath)
        .toString()
        .split("\n")
        .map((line) => line.trim().split(","))
        .forEach((s) => (resp[s[0]] = s[1]));

      const xmlString = fs.readFileSync(codeFilePath).toString();
      const pobCode = zlib
        .deflateSync(new Buffer(xmlString))
        .toString("base64")
        .replaceAll("+", "-")
        .replaceAll("/", "_");

      if (pobCode.length < 20) {
        this.discord.ping("short pob code - " + characterData?.id);
        resp = null;
      } else {
        resp.pobCode = pobCode;
      }
    }

    [
      passivesPath,
      itemsPath,
      codeFilePath,
      maintableFilePath,
      completeFilePath,
    ].forEach((p) => {
      if (fs.existsSync(p)) {
        fs.unlink(p, (e) => {
          if (e) {
            Logger.error("error deleting file " + p, e);
          }
        });
      }
    });

    return resp;
  }
}
