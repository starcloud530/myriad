import { createMyriad, MyriadClientError } from "@myriad/sdk";

const usage = `万象 CLI — 走 @myriad/sdk，同一套北向 API

用法:
  myriad health
  myriad capabilities
  myriad invoke <capability-id> [--input <json>] [--channel <id>]

环境变量:
  MYRIAD_URL   默认 http://127.0.0.1:8791
  MYRIAD_KEY   本地默认 dev-key；生产请用控制台签发的 Key
`;

function envUrl(): string {
  return (process.env.MYRIAD_URL ?? "http://127.0.0.1:8791").replace(/\/+$/, "");
}

function envKey(): string {
  return process.env.MYRIAD_KEY ?? "dev-key";
}

function readFlag(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index < 0) {
    return undefined;
  }
  return args[index + 1];
}

function client() {
  return createMyriad({ baseUrl: envUrl(), apiKey: envKey() });
}

async function main(argv: string[]): Promise<void> {
  const [command, ...rest] = argv;
  if (!command || command === "-h" || command === "--help") {
    process.stdout.write(usage);
    return;
  }

  const myriad = client();

  if (command === "health") {
    process.stdout.write(`${JSON.stringify(await myriad.health(), null, 2)}\n`);
    return;
  }

  if (command === "capabilities") {
    process.stdout.write(`${JSON.stringify({ capabilities: await myriad.listCapabilities() }, null, 2)}\n`);
    return;
  }

  if (command === "invoke") {
    const id = rest[0];
    if (!id) {
      throw new Error("invoke 需要能力 id");
    }
    const raw = readFlag(rest, "--input") ?? "{}";
    const channel = readFlag(rest, "--channel");
    const input = JSON.parse(raw) as Record<string, unknown>;
    const body = await myriad.invoke(id, input, channel ? { channel } : undefined);
    process.stdout.write(`${JSON.stringify(body, null, 2)}\n`);
    return;
  }

  throw new Error(`未知命令: ${command}\n${usage}`);
}

main(process.argv.slice(2)).catch((error: unknown) => {
  if (error instanceof MyriadClientError) {
    process.stderr.write(`${error.status} ${error.code}: ${error.message}\n`);
  } else {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  }
  process.exitCode = 1;
});
