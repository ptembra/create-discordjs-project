export default (verbose: boolean) => ({
  verboseLog: (...args: any[]) => verbose && console.log(args),
  verboseError: (...args: any[]) => verbose && console.error(args),
  verboseInfo: (...args: any[]) => verbose && console.info(args),
});
