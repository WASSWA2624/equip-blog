export class GenerationJobError extends Error {
  constructor(message, { status = "generation_job_error", statusCode = 500 } = {}) {
    super(message);
    this.name = "GenerationJobError";
    this.status = status;
    this.statusCode = statusCode;
  }
}

async function resolvePrismaClient(prisma) {
  if (prisma) {
    return prisma;
  }

  const { getPrismaClient } = await import("@/lib/prisma");

  return getPrismaClient();
}

export async function createGenerationJobRecord(input, prisma) {
  const db = await resolvePrismaClient(prisma);

  return db.generationJob.create({
    data: {
      currentStage: input.currentStage || "request_received",
      equipmentName: input.equipmentName,
      locale: input.locale,
      providerConfigId: input.providerConfigId,
      replaceExistingPost: Boolean(input.replaceExistingPost),
      requestJson: input.requestJson,
      schedulePublishAt: input.schedulePublishAt || null,
      status: input.status || "PENDING",
    },
  });
}

export async function updateGenerationJobRecord(jobId, data, prisma) {
  const db = await resolvePrismaClient(prisma);

  return db.generationJob.update({
    where: {
      id: jobId,
    },
    data,
  });
}

export async function markGenerationJobRunning(jobId, currentStage, prisma) {
  return updateGenerationJobRecord(
    jobId,
    {
      currentStage,
      startedAt: new Date(),
      status: "RUNNING",
    },
    prisma,
  );
}

export async function completeGenerationJob(jobId, data, prisma) {
  return updateGenerationJobRecord(
    jobId,
    {
      ...data,
      finishedAt: new Date(),
      status: "COMPLETED",
    },
    prisma,
  );
}

export async function failGenerationJob(jobId, error, data = {}, prisma) {
  const failure = error instanceof Error ? error : new Error(`${error}`);

  return updateGenerationJobRecord(
    jobId,
    {
      ...data,
      errorMessage: failure.message,
      finishedAt: new Date(),
      status: "FAILED",
    },
    prisma,
  );
}
