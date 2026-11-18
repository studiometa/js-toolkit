### Fixed

- Emit every breakpoint crossing, even when a resize handler, a `media:` mount strategy or another listener reads the breakpoint before the breakpoint service hears the change: responsive components, responsive options and `option<Name>Changed()` hooks no longer miss it (#894)
