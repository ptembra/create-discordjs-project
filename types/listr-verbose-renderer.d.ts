declare module "listr-verbose-renderer" {
  class VerboseRenderer {
    constructor(tasks: any, options: any);

    static get nonTTY(): boolean;

    render(): void;

    end(): void;
  }

  export default VerboseRenderer;
}
