/** Saves a blob to disk, preferring the File System Access API when available. */
export async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'bin'
  const mimeMap: Record<string, string> = {
    mp4: 'video/mp4', webm: 'video/webm', gif: 'image/gif', png: 'image/png',
  }
  const mime = mimeMap[ext] ?? blob.type ?? 'application/octet-stream'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const picker = (window as any).showSaveFilePicker as
    | ((opts: { suggestedName: string; types: Array<{ description: string; accept: Record<string, string[]> }> }) => Promise<FileSystemFileHandle>)
    | undefined

  if (picker) {
    try {
      const handle = await picker({
        suggestedName: filename,
        types: [{ description: ext.toUpperCase() + ' file', accept: { [mime]: [`.${ext}`] } }],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
