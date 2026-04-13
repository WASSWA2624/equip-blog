export const equipmentLifecycleStatusValues = Object.freeze([
  "PLANNED",
  "DRAFT",
  "GENERATED",
  "EDITED",
  "UPDATED",
  "POSTED",
]);

function normalizeNullableText(value) {
  if (value === undefined) {
    return undefined;
  }

  const normalizedValue = `${value || ""}`.trim().replace(/\s+/g, " ");

  return normalizedValue || null;
}

function createLifecycleUpdateData(status, options = {}) {
  const data = {
    lifecycleStatus: status,
  };
  const normalizedNotes = normalizeNullableText(options.notes);

  if (normalizedNotes !== undefined) {
    data.lifecycleNotes = normalizedNotes;
  }

  if (status === "POSTED") {
    data.postedAt = options.postedAt || new Date();
  }

  return data;
}

export async function updateEquipmentLifecycleStatus(tx, { equipmentId, status, ...options }) {
  if (!equipmentId || !status || typeof tx?.equipment?.update !== "function") {
    return null;
  }

  return tx.equipment.update({
    where: {
      id: equipmentId,
    },
    data: createLifecycleUpdateData(status, options),
  });
}

export async function updateEquipmentLifecycleStatusForPost(tx, { postId, status, ...options }) {
  if (!postId || !status || typeof tx?.post?.findUnique !== "function") {
    return null;
  }

  const post = await tx.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      equipmentId: true,
    },
  });

  if (!post?.equipmentId) {
    return null;
  }

  return updateEquipmentLifecycleStatus(tx, {
    equipmentId: post.equipmentId,
    status,
    ...options,
  });
}
