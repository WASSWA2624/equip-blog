const recoverablePrismaErrorCodes = new Set([
  "P1000",
  "P1001",
  "P1002",
  "P1010",
  "P1017",
  "P2021",
  "P2022",
]);

function collectErrorMessages(error) {
  const values = [];
  const queue = [error];
  const visited = new Set();

  while (queue.length) {
    const currentValue = queue.shift();

    if (!currentValue || visited.has(currentValue)) {
      continue;
    }

    visited.add(currentValue);

    if (currentValue instanceof Error && currentValue.message) {
      values.push(currentValue.message);
    } else if (typeof currentValue === "string") {
      values.push(currentValue);
    }

    if (typeof currentValue !== "object") {
      continue;
    }

    queue.push(
      currentValue.cause,
      currentValue.meta,
      currentValue.meta?.driverAdapterError,
      currentValue.meta?.driverAdapterError?.cause,
    );
  }

  return values.join(" ");
}

export function isRecoverablePrismaError(error) {
  const code = typeof error?.code === "string" ? error.code : "";

  if (recoverablePrismaErrorCodes.has(code)) {
    return true;
  }

  const combinedMessage = collectErrorMessages(error);

  if (!combinedMessage) {
    return false;
  }

  return /tabledoesnotexist|does not exist|unknown database|access denied|can't reach database server|connection refused|timed out|econnrefused|enotfound/i.test(
    combinedMessage,
  );
}

export function isRecoverablePrismaReadError(error) {
  return isRecoverablePrismaError(error);
}
