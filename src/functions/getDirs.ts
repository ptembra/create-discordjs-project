import path from "path";

export default function getDirs(template: string, target: string) {
  const targetDir = path.join(process.cwd(), target).replace("%20", " ");
  const templateDir = path
    .join(targetDir, `node_modules`, template.toLowerCase())
    .replace("%20", " ");

  return { targetDir, templateDir };
}
