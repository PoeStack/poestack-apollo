import PostgresService from "../mongo/postgres-service";
import { singleton } from "tsyringe";
import fetch from "node-fetch";
import fs from "fs";
import ItemValueHistoryService from "./item-value-history-service";

@singleton()
export default class PoeNinjaAuditService {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly itemValueHistoryService: ItemValueHistoryService
  ) {}

  public async runAduit() {
    const resp = await fetch(
      "https://poe.ninja/api/data/itemoverview?league=Crucible&type=Scarab&language=en"
    );
    const body = await resp.json();
    let out = ['name,poeninja,poestack'];
    const pValueTarget = "p10";
    for (const line of body.lines) {
      const pValue =
        await this.itemValueHistoryService.fetchFirstPValueByItemGroupHashKey(
          "Crucible",
          line.name.toLowerCase(),
          pValueTarget
        );

      out.push(
        `${line.name}, ${line.chaosValue}, ${pValue}`
      );
    }

    fs.writeFileSync(`${pValueTarget} poeninja audit.txt`, out.join("\n"));
  }
}
