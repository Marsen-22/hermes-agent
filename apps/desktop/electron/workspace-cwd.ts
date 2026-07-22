import path from 'node:path'

/** True when `dir` lives inside a packaged app bundle / install tree. */
function isPackagedInstallPath(dir, { installRoots, isPackaged }: { installRoots: string[]; isPackaged: boolean }) {
  if (!isPackaged || !dir) {
    return false
  }

  let resolved

  try {
    resolved = path.resolve(String(dir))
  } catch {
    return false
  }

  const roots = new Set((installRoots ?? []).filter(Boolean).map(candidate => path.resolve(String(candidate))))

  for (const root of roots) {
    if (resolved === root) {
      return true
    }

    // Node 22+ throws `RangeError: path should be a path.relative()'d string`
    // when the result would be a path that goes above `root` AND contains
    // another absolute segment. That's exactly the "not under this root"
    // case we want to return false for, so treat a throw as not-inside.
    let rel: string

    try {
      rel = path.relative(root, resolved) as any
    } catch {
      continue
    }

    if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) {
      return true
    }
  }

  return false
}

export { isPackagedInstallPath }
