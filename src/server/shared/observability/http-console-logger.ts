import chalk from "chalk"

type HttpLogInput = {
  method: string
  path: string
  status: number
  durationMs: number
}

const METHOD_COLORS: Record<string, (value: string) => string> = {
  GET: chalk.green.bold,
  POST: chalk.blue.bold,
  PUT: chalk.yellow.bold,
  PATCH: chalk.magenta.bold,
  DELETE: chalk.red.bold,
}

function getStatusColor(status: number) {
  if (status >= 500) {
    return chalk.red.bold
  }

  if (status >= 400) {
    return chalk.yellow.bold
  }

  if (status >= 300) {
    return chalk.cyan.bold
  }

  return chalk.green.bold
}

export function logHttpRequestResult({ method, path, status, durationMs }: HttpLogInput) {
  if (process.env.ENABLE_HTTP_COLOR_LOGS !== "true") {
    return
  }

  const methodColor = METHOD_COLORS[method] ?? chalk.white.bold
  const statusColor = getStatusColor(status)
  const methodLabel = method.padEnd(6, " ")

  console.log(`${methodColor(methodLabel)} ${path} ${statusColor(String(status))} ${chalk.bold(`${durationMs}ms`)}`)
}
