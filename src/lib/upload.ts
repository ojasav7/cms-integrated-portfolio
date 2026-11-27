/**
 * First file carried by a drop, or null when the drop had none (dragging selected
 * text or a link is legal and must not crash the picker).
 */
export function pickDroppedFile(
  files: ArrayLike<File> | null | undefined,
): File | null {
  return files && files.length > 0 ? files[0] : null
}
