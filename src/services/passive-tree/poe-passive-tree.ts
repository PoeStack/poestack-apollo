import {
  type GqlPassiveTreeResponse,
  type GqlPassiveTreeNode,
  type GqlPassiveTreeConnection,
} from "../../models/skill-tree-models";
import fs from "fs";

export default class PoePassiveTree {
  private readonly passiveTree: any;
  private orbitPoints: any;
  private groupMap: any;
  private nodeMap: Record<string, GqlPassiveTreeNode>;
  private connections: GqlPassiveTreeConnection[];

  private cachedResponse: GqlPassiveTreeResponse;

  constructor(dataPath: string) {
    this.passiveTree = JSON.parse(fs.readFileSync(dataPath).toString());
    this.computeOrbitPoints();
    this.computeGroups();
    this.computeNodeMap();
    this.computeConnections();
  }

  public findMasteryByGroup(group: number): GqlPassiveTreeNode | null {
    return Object.values(this.nodeMap).find(
      (e) => e.isMastery && e.group === group
    );
  }

  private computeGroups() {
    const groups = Object.keys(this.passiveTree.groups).map((groupId) => {
      const group = this.passiveTree.groups[groupId];
      const maximumOrbit = Math.max(...group.orbits);
      const radius = this.passiveTree.constants.orbitRadii[maximumOrbit];
      return {
        ...group,
        radius,
        groupId,
      };
    });

    this.groupMap = groups.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.groupId]: cur,
      }),
      {}
    );
  }

  private computeNodeMap() {
    const nodes = Object.keys(this.passiveTree.nodes).map((nodeId) => {
      const node = this.passiveTree.nodes[nodeId];

      if (node.skill && node.group) {
        if (node.orbit !== undefined && node.orbitIndex !== undefined) {
          const { x, y } = this.groupMap[node.group];
          const orbitDelta = this.orbitPoints[node.orbit][node.orbitIndex];

          const gqlNode: GqlPassiveTreeNode = {
            ...node,
            ...{
              hash: nodeId,
              x: x + orbitDelta.x,
              y: y + orbitDelta.y,
            },
          };

          if (gqlNode.isKeystone) {
            gqlNode.size = 60;
          } else if (gqlNode.isNotable || gqlNode.isJewelSocket) {
            gqlNode.size = 45;
          } else {
            gqlNode.size = 30;
          }

          return gqlNode;
        }
      }

      return null;
    });

    this.nodeMap = nodes
      .filter((n) => !!n)
      .reduce(
        (acc, cur) => ({
          ...acc,
          [cur.hash]: cur,
        }),
        {}
      );
  }

  private computeConnections() {
    const connections: any[] = [];
    Object.keys(this.nodeMap).forEach((nodeOneId) => {
      const nodeOne = this.nodeMap[nodeOneId];

      nodeOne.out?.forEach((nodeTwoId) => {
        const nodeTwo = this.nodeMap[nodeTwoId];

        if (!nodeTwo) {
          return;
        }

        const isCurved =
          nodeOne.group === nodeTwo.group && nodeOne.orbit === nodeTwo.orbit;
        const nodes = [nodeOne, nodeTwo];

        nodes.sort((a, b) => {
          if (
            Number.isInteger(a.orbitIndex) &&
            Number.isInteger(b.orbitIndex)
          ) {
            return a.orbitIndex < b.orbitIndex ? -1 : 1;
          }

          return -1;
        });

        const [fromNode, toNode] = nodes;

        const connection: GqlPassiveTreeConnection = {
          fromNode: fromNode?.hash.toString(),
          toNode: toNode?.hash.toString(),
          curved: isCurved,
        };

        connections.push(connection);
      });
    });

    this.connections = connections;
  }

  private computeOrbitPoints() {
    this.orbitPoints = this.passiveTree.constants.skillsPerOrbit.map(
      (skillsInOrbit: number, orbitIndex: number) => {
        const radiansPerIndex = (2 * Math.PI) / skillsInOrbit;
        const radius = this.passiveTree.constants.orbitRadii[orbitIndex];
        const results: any[] = [];

        for (const i of Array.from(Array(skillsInOrbit).keys())) {
          const [x, y] = [
            radius * Math.sin(radiansPerIndex * i),
            radius * Math.cos(radiansPerIndex * i),
          ];

          results.push({
            x,
            y: -y, // this is negative because positive y goes downwards in canvas land
          });
        }

        return results;
      }
    );
  }

  public getNode(hash: string): GqlPassiveTreeNode | undefined {
    return this.nodeMap[hash];
  }

  public getResponse() {
    if (this.cachedResponse) {
      return this.cachedResponse;
    }

    const connectionMap = this.connections
      .filter((c) => {
        const fromNode = this.getNode(c.fromNode);
        const toNode = this.getNode(c.toNode);
        return (
          !(fromNode.isMastery || toNode.isMastery) &&
          !(fromNode.ascendancyName || toNode.ascendancyName)
        );
      })
      .reduce((acc, cur) => {
        const fromNodeHash = cur.fromNode;
        return {
          ...acc,
          [fromNodeHash]: acc[fromNodeHash]
            ? [...acc[fromNodeHash], cur]
            : [cur],
        };
      }, {});

    const mappedConnectionMap = Object.keys(connectionMap)
      .map((fromNodeId) => connectionMap[fromNodeId])
      .reduce(
        (acc, cur) =>
          cur.reduce((innerAcc, innerCur) => [...innerAcc, innerCur], acc),
        []
      );

    const tNodeMap: Record<string, GqlPassiveTreeNode> = {};
    for (const [key, value] of Object.entries(this.nodeMap)) {
      tNodeMap[key] = {
        hash: value.hash,
        name: value.name,
        notable: value.isNotable,
        keystone: value.isKeystone,
        x: value.x,
        y: value.y,
        orbit: value.orbit,
        orbitIndex: value.orbitIndex,
        out: value.out,
        size: value.size,
        stats: value.stats,
      } as any;
    }

    const resp: GqlPassiveTreeResponse = {
      constants: {
        ...this.passiveTree.constants,
        ...{
          minX: this.passiveTree.min_x,
          minY: this.passiveTree.min_y,
          maxX: this.passiveTree.max_x,
          maxY: this.passiveTree.max_y,
        },
      },
      connectionMap: mappedConnectionMap,
      nodeMap: tNodeMap,
    };
    this.cachedResponse = resp;

    return this.cachedResponse;
  }
}
