import * as filesystem from "fs-extra";
import { Main } from "../main";

/**
 * The [[FilesBuilder]] class allows you to manage the generation, migration, and everything necessary to run the [[ContentGenerate]]
 */
export class FilesBuilder {
  /**
   * Location of the file where the project will be built
   */
  public readonly directory: string;

  /**
   * @param directory
   */
  constructor(directory: string) {
    this.directory = directory;
  }

  /**
   * The init function allows you to check the existence of the file where the automatic generation of this tool will be located.
   *
   * @return Promise<void | never>
   */
  public init = async (): Promise<void> => {
    const exists = await filesystem.pathExists(this.directory);
    if (exists) {
      await filesystem.remove(this.directory);
    }
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await filesystem.ensureDir(this.directory);
    Main.onFolderGenerate();
  };

  /**
   * The public category function allows you to pre-generate the .lua files that will contain the native complements for your [Jetbrain IDE](https://www.jetbrains.com/).
   *
   * @param data
   *
   * @return void
   */
  public category = async (data: Record<string, unknown>): Promise<void> => {
    for (const category in data) {
      const filepath = `${this.directory}/${category}.lua`;
      try {
        await filesystem.ensureFile(filepath);
        await filesystem.appendFile(filepath, "---@meta\n\n");
        console.info(`Create file successfully: ${category}`);
      } catch (error) {
        console.error(error);
      }
    }
  };

  /**
   * Allows to update a file while keeping the values present in this file previously.
   *
   * @param stats
   * @param files Name of the currently updated file
   * @param data Data to be inserted in the file
   * @param nativeName Name of the native FiveM
   *
   * @return Promise<void | string>
   */
  public update = async (
    files: string,
    data: string,
  ): Promise<void> => {
    const fileName = `${this.directory}/${files}.lua`;
    
    try {
      await filesystem.appendFile(fileName, data);
    } catch (error) {
      throw new Error(`can't update file ${files}\n${error}`);
    }
  };
}
