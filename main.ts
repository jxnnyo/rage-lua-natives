import fetch from "node-fetch";
import { FilesBuilder } from "./src/files-builder";
import { ContentGenerate } from "./src/content-generate";
import figlet from "figlet";
import { GamesType } from "./src/enum/GamesType";
import { terminal as term } from "terminal-kit";

/**
 * The [[Main]] class that groups together all the logical execution processes of the system.
 */
export class Main {
  /**
   * @param gametype
   */
  private static getNativeLink = (gametype: GamesType): string => {
    switch (gametype) {
      default:
      case GamesType.GTA:
        return "https://static.cfx.re/natives/natives.json";
      case GamesType.RDR3:
        return "https://raw.githubusercontent.com/VORPCORE/RDR3natives/main/rdr3natives.json";
      case GamesType.Cfx:
        return "https://static.cfx.re/natives/natives_cfx.json";
    }
  };

  /**
   * @param gametype
   */
  private static getNativeDocsUrl = (gametype: GamesType): string => {
    switch (gametype) {
      case GamesType.RDR3:
        return "https://rdr3natives.com/?_";
      default:
        return "https://docs.fivem.net/natives/?_";
    }
  };

  /**
   * Startup logicNom de la native fivem
   *
   * @param dir Location of the file where the project will be built
   *
   * @param gametype
   * @return void
   */
  public static onEnable = async (
    dir: string,
    gametype: GamesType
  ): Promise<void> => {
    const jsonUrl = Main.getNativeLink(gametype);

    if (!jsonUrl) return;

    try {
      const response = await fetch(jsonUrl);
      const content = await response.text();
      const json = JSON.parse(content);

      const files = new FilesBuilder(dir);
      await files.init();

      await files.category(json);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const builder = new ContentGenerate(files).setDocumentationUrl(
        Main.getNativeDocsUrl(gametype)
      );

      await builder.generateTemplate(json);
    } catch (err) {
      term.red(String(err));
    }
  };

  /**
   * Folder generate logic
   * 
   * @return void
   */
  public static onFolderGenerate = () => {
    term.cyan("Create build directory successfully");
  };

  /**
   * File update logic
   *
   * @param stats
   * @param filename Name of the updated file
   * @param nativename Name of the native fivem
   *
   * @return void
   */
  public static onFileUpdate = (
    stats: { native: { total: number; current: number } },
    filename: string,
    nativename: string
  ): void => {
    stats.native.current++;
    term.green(`[File: ${filename}] [Native: ${nativename}]\n`);
    if (stats.native.current === stats.native.total) process.exit();
  };
}

figlet("JetBrainIDE-CitizenFX", (err, data) => {
  term.blue(data);
  term.red("\n Dylan Malandain - @iTexZoz \n");
});

term.cyan(
  "Welcome to the native completion generator tool for Jetbrain IDEs for cfx.re projects.\n"
);
// term.cyan("Please select the game concerned.\n");

// let items = [
//   "1. (FiveM) GTA V",
//   "2. (RedM) Red Dead Redemption 2",
//   "3. CFX (Is Available for RedM && FiveM)",
// ];

(async () => {
  await Main.onEnable("build/cfx/GTAV", GamesType.GTA);
  await Main.onEnable("build/cfx/RDR3", GamesType.RDR3);
  await Main.onEnable("build/cfx/CFX-NATIVE", GamesType.Cfx);

  process.exit();
})();
