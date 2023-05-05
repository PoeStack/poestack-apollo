import { Logger } from './../logger';
import { singleton } from "tsyringe";
import PoePassiveTree from "./poe-passive-tree";

@singleton()
export class PassiveTreeService {
  passiveTree: PoePassiveTree;
  atlasTree: PoePassiveTree;

  public load() {
    this.passiveTree = new PoePassiveTree("data/poe/3.20/passive_tree.json");
    this.passiveTree.getResponse();
    this.atlasTree = new PoePassiveTree("data/poe/3.20/atlas_tree.json");
    this.atlasTree.getResponse();
    Logger.info("loaded passive trees");
  }
}
