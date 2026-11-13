/**
 * Premium neon anatomical wireframe illustrations — Biblioteca EvoluaFit.
 * Medical-line anatomy: fiber bundles, divisions, volume. No opaque fills.
 * Color + glow via currentColor and CSS drop-shadow on the card accent.
 */

const SW = 1.25
const SW_FINE = 0.85
const SW_MID = 1.45
const SW_BOLD = 1.85

function SvgFrame({ children, className = '' }) {
  return (
    <svg
      className={`mg-illust mg-illust--wire ${className}`.trim()}
      viewBox="0 0 160 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

function L({ d, w = SW, o = 1 }) {
  return (
    <path
      d={d}
      stroke="currentColor"
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={o}
    />
  )
}

function Fan({ paths, w = SW_FINE, o = 0.55 }) {
  return paths.map((d, i) => <L key={i} d={d} w={w} o={o} />)
}

/** Peitoral — frontal pec major fibers, sternum, clavicle */
export function IllustChest() {
  return (
    <SvgFrame className="mg-illust--chest">
      <L d="M68 6 H92 V26" w={SW} o={0.65} />
      <L d="M28 36 C48 20 68 16 80 16 C92 16 112 20 132 36" w={SW_BOLD} o={0.92} />
      <L d="M28 36 L12 58 M132 36 L148 58" w={SW} o={0.55} />
      <L d="M32 38 L38 68 C42 96 48 128 56 158 L70 176 H90 L104 158 C112 128 118 96 122 68 L128 38" w={SW_BOLD} o={0.95} />
      <L d="M80 26 V152" w={SW_MID} o={0.82} />
      {/* Pec plates */}
      <L d="M40 42 C58 32 70 32 80 38 C72 62 58 82 36 96 C30 76 30 54 40 42 Z" w={SW_MID} o={0.95} />
      <L d="M120 42 C102 32 90 32 80 38 C88 62 102 82 124 96 C130 76 130 54 120 42 Z" w={SW_MID} o={0.95} />
      <Fan
        o={0.62}
        paths={[
          'M78 40 C66 52 52 68 38 84',
          'M76 44 C64 58 50 74 36 90',
          'M74 48 C62 62 48 78 36 92',
          'M72 52 C60 66 48 80 38 90',
          'M70 56 C60 68 50 80 42 88',
          'M68 60 C60 70 52 80 46 86',
          'M66 42 C58 54 48 68 40 78',
          'M64 46 C56 58 46 72 40 82',
        ]}
      />
      <Fan
        o={0.62}
        paths={[
          'M82 40 C94 52 108 68 122 84',
          'M84 44 C96 58 110 74 124 90',
          'M86 48 C98 62 112 78 124 92',
          'M88 52 C100 66 112 80 122 90',
          'M90 56 C100 68 110 80 118 88',
          'M92 60 C100 70 108 80 114 86',
          'M94 42 C102 54 112 68 120 78',
          'M96 46 C104 58 114 72 120 82',
        ]}
      />
      <L d="M36 96 C54 108 68 114 80 114 C92 114 106 108 124 96" w={SW_MID} o={0.85} />
      <L d="M58 66 C60 64 64 64 66 66" w={SW_FINE} o={0.5} />
      <L d="M94 66 C96 64 100 64 102 66" w={SW_FINE} o={0.5} />
      <Fan
        o={0.35}
        paths={['M62 122 H98', 'M62 136 H98', 'M70 122 V150', 'M90 122 V150']}
      />
    </SvgFrame>
  )
}

/** Costas — traps, rhomboids, lats (posterior) */
export function IllustBack() {
  return (
    <SvgFrame className="mg-illust--back">
      <L d="M72 4 H88 V22" w={SW} o={0.65} />
      <L d="M22 34 C42 18 60 14 80 14 C100 14 118 18 138 34" w={SW_BOLD} o={0.92} />
      <L d="M22 34 L8 56 M138 34 L152 56" w={SW} o={0.5} />
      <L d="M26 36 L32 64 C28 92 36 124 52 152 L70 176 H90 L108 152 C124 124 132 92 128 64 L134 36" w={SW_BOLD} o={0.95} />
      <L d="M80 22 V168" w={SW_MID} o={0.85} />
      {/* Traps diamond */}
      <L d="M80 22 L118 54 L80 68 L42 54 Z" w={SW_MID} o={0.92} />
      <Fan
        o={0.58}
        paths={[
          'M80 28 L110 52', 'M80 34 L102 54', 'M80 40 L94 56', 'M80 46 L86 58',
          'M80 28 L50 52', 'M80 34 L58 54', 'M80 40 L66 56', 'M80 46 L74 58',
        ]}
      />
      <L d="M56 58 L80 72 L104 58" w={SW} o={0.8} />
      <L d="M60 66 L80 78 L100 66" w={SW_FINE} o={0.55} />
      {/* Lats */}
      <L d="M36 58 C22 82 20 114 36 146 C52 128 66 102 74 80" w={SW_MID} o={0.9} />
      <L d="M124 58 C138 82 140 114 124 146 C108 128 94 102 86 80" w={SW_MID} o={0.9} />
      <Fan
        o={0.55}
        paths={[
          'M40 66 C28 90 26 116 38 142',
          'M46 70 C36 94 34 118 44 142',
          'M52 74 C44 96 42 120 50 140',
          'M58 78 C52 98 50 120 56 138',
          'M64 82 C60 100 58 120 62 136',
          'M120 66 C132 90 134 116 122 142',
          'M114 70 C124 94 126 118 116 142',
          'M108 74 C116 96 118 120 110 140',
          'M102 78 C108 98 110 120 104 138',
          'M96 82 C100 100 102 120 98 136',
        ]}
      />
      <L d="M68 90 V160" w={SW_FINE} o={0.5} />
      <L d="M92 90 V160" w={SW_FINE} o={0.5} />
    </SvgFrame>
  )
}

/** Pernas — frontal quads */
export function IllustLegs() {
  return (
    <SvgFrame className="mg-illust--legs">
      <L d="M24 10 H136" w={SW_BOLD} o={0.9} />
      <L d="M32 10 V28 M128 10 V28 M80 10 V26" w={SW} o={0.6} />
      <L d="M34 28 C46 28 58 34 64 48 L70 90 C74 120 66 148 60 176 H36 C30 148 26 118 30 88 L34 48 Z" w={SW_BOLD} o={0.95} />
      <L d="M126 28 C114 28 102 34 96 48 L90 90 C86 120 94 148 100 176 H124 C130 148 134 118 130 88 L126 48 Z" w={SW_BOLD} o={0.95} />
      {/* Rectus femoris */}
      <L d="M48 40 C52 70 52 110 48 158" w={SW_MID} o={0.9} />
      <L d="M112 40 C108 70 108 110 112 158" w={SW_MID} o={0.9} />
      <Fan
        o={0.55}
        paths={[
          'M42 50 C46 82 46 120 42 160',
          'M54 50 C58 82 58 120 54 160',
          'M118 50 C114 82 114 120 118 160',
          'M106 50 C102 82 102 120 106 160',
        ]}
      />
      {/* Vastus lateralis */}
      <L d="M64 46 C68 80 66 120 62 168" w={SW_MID} o={0.85} />
      <L d="M96 46 C92 80 94 120 98 168" w={SW_MID} o={0.85} />
      <Fan o={0.5} paths={['M68 60 C70 95 68 130 64 165', 'M92 60 C90 95 92 130 96 165']} />
      {/* Vastus medialis */}
      <L d="M34 88 C38 118 44 148 50 172" w={SW_MID} o={0.85} />
      <L d="M126 88 C122 118 116 148 110 172" w={SW_MID} o={0.85} />
      <L d="M34 108 C42 132 52 152 58 170" w={SW_FINE} o={0.58} />
      <L d="M126 108 C118 132 108 152 102 170" w={SW_FINE} o={0.58} />
      <L d="M38 170 H62 M98 170 H122" w={SW} o={0.7} />
    </SvgFrame>
  )
}

/** Glúteos — posterior / slight 3-4 */
export function IllustGlutes() {
  return (
    <SvgFrame className="mg-illust--glutes">
      <L d="M40 18 C58 10 70 8 80 8 C90 8 102 10 120 18" w={SW_MID} o={0.85} />
      <L d="M36 28 C30 52 34 92 50 132 C62 154 72 166 80 170 C88 166 98 154 110 132 C126 92 130 52 124 28 C110 16 94 12 80 12 C66 12 50 16 36 28 Z" w={SW_BOLD} o={0.95} />
      <L d="M80 44 V148" w={SW_MID} o={0.82} />
      {/* Medius */}
      <L d="M44 32 C56 28 70 32 76 44 C68 52 56 54 42 50 C40 42 40 34 44 32 Z" w={SW_MID} o={0.9} />
      <L d="M116 32 C104 28 90 32 84 44 C92 52 104 54 118 50 C120 42 120 34 116 32 Z" w={SW_MID} o={0.9} />
      <Fan o={0.55} paths={['M48 38 C58 38 68 42 74 46', 'M46 44 C56 44 66 48 72 50', 'M112 38 C102 38 92 42 86 46', 'M114 44 C104 44 94 48 88 50']} />
      {/* Maximus */}
      <L d="M40 56 C36 84 42 116 58 146 C64 132 72 108 76 80 C74 64 60 54 40 56 Z" w={SW_MID} o={0.92} />
      <L d="M120 56 C124 84 118 116 102 146 C96 132 88 108 84 80 C86 64 100 54 120 56 Z" w={SW_MID} o={0.92} />
      <Fan
        o={0.55}
        paths={[
          'M46 68 C42 92 48 120 60 142',
          'M52 64 C48 90 54 116 64 138',
          'M58 62 C56 88 60 112 68 134',
          'M64 64 C62 86 66 108 72 128',
          'M70 68 C68 88 70 106 74 122',
          'M114 68 C118 92 112 120 100 142',
          'M108 64 C112 90 106 116 96 138',
          'M102 62 C104 88 100 112 92 134',
          'M96 64 C98 86 94 108 88 128',
          'M90 68 C92 88 90 106 86 122',
        ]}
      />
      <L d="M52 138 C64 150 74 154 80 154 C86 154 96 150 108 138" w={SW} o={0.7} />
    </SvgFrame>
  )
}

/** Ombros — 3 deltoid heads */
export function IllustShoulders() {
  return (
    <SvgFrame className="mg-illust--shoulders">
      <L d="M68 4 C68 -2 92 -2 92 4 C92 14 86 20 80 20 C74 20 68 14 68 4 Z" w={SW} o={0.8} />
      <L d="M80 20 V42" w={SW} o={0.75} />
      <L d="M58 72 V148 H102 V72" w={SW} o={0.5} />
      <Fan o={0.3} paths={['M64 90 H96', 'M64 108 H96', 'M64 126 H96']} />
      <L d="M20 56 H140" w={SW} o={0.7} />
      {/* Left lateral */}
      <L d="M8 58 C-2 72 -2 98 12 120 C28 108 38 88 38 68 C32 54 18 52 8 58 Z" w={SW_BOLD} o={0.95} />
      <Fan o={0.58} paths={['M12 70 C4 84 4 102 16 116', 'M18 66 C10 82 10 100 22 114', 'M24 68 C18 84 18 100 28 112', 'M30 72 C26 86 26 100 32 110']} />
      {/* Left anterior */}
      <L d="M36 52 C50 46 62 54 66 68 C56 78 44 80 32 72 C28 62 30 54 36 52 Z" w={SW_MID} o={0.9} />
      <Fan o={0.55} paths={['M40 58 C48 58 56 64 62 70', 'M38 64 C46 66 54 72 60 74', 'M40 70 C48 72 54 74 58 76']} />
      {/* Left posterior */}
      <L d="M30 64 C20 78 20 100 32 116 C42 104 46 88 42 74 C40 66 34 62 30 64 Z" w={SW} o={0.78} />
      {/* Right lateral */}
      <L d="M152 58 C162 72 162 98 148 120 C132 108 122 88 122 68 C128 54 142 52 152 58 Z" w={SW_BOLD} o={0.95} />
      <Fan o={0.58} paths={['M148 70 C156 84 156 102 144 116', 'M142 66 C150 82 150 100 138 114', 'M136 68 C142 84 142 100 132 112', 'M130 72 C134 86 134 100 128 110']} />
      {/* Right anterior */}
      <L d="M124 52 C110 46 98 54 94 68 C104 78 116 80 128 72 C132 62 130 54 124 52 Z" w={SW_MID} o={0.9} />
      <Fan o={0.55} paths={['M120 58 C112 58 104 64 98 70', 'M122 64 C114 66 106 72 100 74', 'M120 70 C112 72 106 74 102 76']} />
      {/* Right posterior */}
      <L d="M130 64 C140 78 140 100 128 116 C118 104 114 88 118 74 C120 66 126 62 130 64 Z" w={SW} o={0.78} />
      <L d="M32 54 C40 48 48 48 56 54" w={SW} o={0.65} />
      <L d="M104 54 C112 48 120 48 128 54" w={SW} o={0.65} />
    </SvgFrame>
  )
}

/** Bíceps — flexed arm, long + short head */
export function IllustBiceps() {
  return (
    <SvgFrame className="mg-illust--biceps">
      <L d="M30 148 C24 120 30 86 50 58 C66 34 92 24 118 32 C134 38 144 54 140 72 C136 90 120 100 102 106 L84 116 C78 122 76 134 76 146 V168 C76 178 64 184 50 178 C36 172 32 162 30 148 Z" w={SW_BOLD} o={0.95} />
      <L d="M104 34 C118 38 132 50 136 66" w={SW} o={0.7} />
      <L d="M96 40 C84 58 72 80 62 108" w={SW_MID} o={0.88} />
      <L d="M114 52 C100 68 86 90 74 114" w={SW_MID} o={0.85} />
      <Fan o={0.55} paths={['M100 44 C88 62 76 84 66 108', 'M108 48 C96 66 84 88 74 110', 'M118 58 C106 74 94 94 84 114']} />
      {/* Peak belly */}
      <L d="M68 62 C80 52 98 52 112 64 C106 82 90 94 72 90 C64 82 62 70 68 62 Z" w={SW_MID} o={0.92} />
      <Fan o={0.58} paths={['M74 68 C84 62 96 62 106 70', 'M72 76 C84 70 96 70 108 76', 'M74 84 C86 80 96 80 104 84']} />
      <L d="M58 104 C66 116 74 132 76 150" w={SW_FINE} o={0.55} />
      <L d="M74 120 C68 138 58 156 48 168" w={SW_MID} o={0.75} />
      <L d="M82 124 C76 142 66 158 56 168" w={SW_FINE} o={0.5} />
    </SvgFrame>
  )
}

/** Tríceps — horseshoe heads */
export function IllustTriceps() {
  return (
    <SvgFrame className="mg-illust--triceps">
      <L d="M52 12 C76 4 112 16 124 46 L136 96 C140 124 128 154 102 168 C84 176 64 168 54 150 L36 108 C28 84 32 54 44 32 C48 22 50 16 52 12 Z" w={SW_BOLD} o={0.95} />
      <L d="M72 28 C64 56 60 92 68 132 C72 148 80 162 90 170" w={SW_MID} o={0.88} />
      <L d="M98 36 C108 60 114 96 106 136 C100 152 90 164 82 170" w={SW_MID} o={0.88} />
      <Fan o={0.55} paths={['M66 36 C58 64 54 98 62 136', 'M78 32 C70 60 66 96 74 136', 'M106 42 C114 68 118 100 110 138', 'M92 38 C100 64 104 98 98 136']} />
      <L d="M76 102 C72 122 76 146 86 164" w={SW} o={0.75} />
      <L d="M90 102 C94 122 90 146 86 164" w={SW} o={0.75} />
      <L d="M70 90 C78 102 90 102 98 90" w={SW_MID} o={0.85} />
      <L d="M68 116 C78 128 90 128 100 116" w={SW_FINE} o={0.55} />
      <L d="M86 156 C90 168 96 176 106 178" w={SW} o={0.7} />
    </SvgFrame>
  )
}

/** Abdômen — rectus + inscriptions + obliques */
export function IllustAbs() {
  return (
    <SvgFrame className="mg-illust--abs">
      <L d="M48 8 H112 C124 8 132 20 132 34 V148 C132 166 120 178 100 178 H60 C40 178 28 166 28 148 V34 C28 20 36 8 48 8 Z" w={SW_BOLD} o={0.95} />
      <L d="M80 18 V164" w={SW_MID} o={0.82} />
      <L d="M40 48 H120" w={SW} o={0.78} />
      <L d="M36 78 H124" w={SW} o={0.78} />
      <L d="M40 108 H120" w={SW} o={0.78} />
      <L d="M50 24 H74 V48 H50 Z" w={SW_FINE} o={0.72} />
      <L d="M86 24 H110 V48 H86 Z" w={SW_FINE} o={0.72} />
      <L d="M48 52 H74 V78 H48 Z" w={SW_FINE} o={0.72} />
      <L d="M86 52 H112 V78 H86 Z" w={SW_FINE} o={0.72} />
      <L d="M48 82 H74 V108 H48 Z" w={SW_FINE} o={0.72} />
      <L d="M86 82 H112 V108 H86 Z" w={SW_FINE} o={0.72} />
      <Fan
        o={0.42}
        w={0.75}
        paths={[
          'M54 30 H70', 'M54 38 H70', 'M90 30 H106', 'M90 38 H106',
          'M52 58 H70', 'M52 66 H70', 'M90 58 H108', 'M90 66 H108',
          'M52 88 H70', 'M52 96 H70', 'M90 88 H108', 'M90 96 H108',
        ]}
      />
      <L d="M30 58 C36 74 40 96 36 124" w={SW} o={0.65} />
      <L d="M130 58 C124 74 120 96 124 124" w={SW} o={0.65} />
      <Fan o={0.42} paths={['M32 70 C38 86 40 106 38 120', 'M128 70 C122 86 120 106 122 120']} />
      <L d="M58 128 C70 146 80 156 80 156 C80 156 90 146 102 128" w={SW} o={0.7} />
    </SvgFrame>
  )
}

/** Lombar */
export function IllustLowerBack() {
  return (
    <SvgFrame className="mg-illust--lower-back">
      <L d="M80 8 C106 24 128 54 128 90 C128 128 106 156 80 176 C54 156 32 128 32 90 C32 54 54 24 80 8 Z" w={SW_BOLD} o={0.95} />
      <L d="M80 28 V164" w={SW_MID} o={0.82} />
      <L d="M60 42 V152" w={SW_MID} o={0.85} />
      <L d="M100 42 V152" w={SW_MID} o={0.85} />
      <Fan o={0.52} paths={['M52 54 V140', 'M68 54 V140', 'M92 54 V140', 'M108 54 V140']} />
      <L d="M60 60 L34 48" w={SW} o={0.7} />
      <L d="M100 60 L126 48" w={SW} o={0.7} />
      <L d="M60 88 L30 74" w={SW} o={0.7} />
      <L d="M100 88 L130 74" w={SW} o={0.7} />
      <L d="M60 116 L36 106" w={SW} o={0.65} />
      <L d="M100 116 L124 106" w={SW} o={0.65} />
      <L d="M60 140 L42 132" w={SW_FINE} o={0.5} />
      <L d="M100 140 L118 132" w={SW_FINE} o={0.5} />
    </SvgFrame>
  )
}

/** Cardio — anatomical heart + pulse */
export function IllustCardio() {
  return (
    <SvgFrame className="mg-illust--cardio">
      <L d="M80 168 C48 140 24 116 24 78 C24 52 46 32 68 32 C74 32 80 38 80 38 C80 38 86 32 92 32 C114 32 136 52 136 78 C136 116 112 140 80 168 Z" w={SW_BOLD} o={0.95} />
      <L d="M80 58 V148" w={SW} o={0.7} />
      <L d="M40 78 C52 72 66 72 80 78" w={SW} o={0.75} />
      <L d="M80 78 C94 72 108 72 120 78" w={SW} o={0.75} />
      <L d="M38 106 C52 100 66 100 80 108" w={SW} o={0.7} />
      <L d="M80 108 C94 100 108 100 122 106" w={SW} o={0.7} />
      <L d="M80 40 C80 26 74 16 64 10" w={SW} o={0.75} />
      <L d="M80 40 C86 26 98 16 112 12" w={SW} o={0.75} />
      <L d="M68 50 C56 44 46 36 42 24" w={SW_FINE} o={0.55} />
      <L d="M34 128 H52 L60 100 L72 152 L84 116 L92 128 H126" w={SW_MID} o={0.75} />
    </SvgFrame>
  )
}

/** Mobilidade — articulated stretch figure */
export function IllustMobility() {
  return (
    <SvgFrame className="mg-illust--mobility">
      <L d="M72 6 C80 6 86 12 86 20 C86 28 80 34 72 34 C64 34 58 28 58 20 C58 12 64 6 72 6 Z" w={SW} o={0.85} />
      <L d="M72 34 V72" w={SW_BOLD} o={0.9} />
      <L d="M72 50 L28 70 M72 50 L116 70" w={SW_MID} o={0.85} />
      <L d="M28 70 L14 98 M116 70 L130 98" w={SW} o={0.8} />
      <L d="M58 72 C46 90 36 118 44 152 C56 162 68 158 72 150 C76 158 88 162 100 152 C108 118 98 90 86 72 Z" w={SW_BOLD} o={0.9} />
      <Fan o={0.5} paths={['M60 92 C54 116 54 136 60 150', 'M84 92 C90 116 90 136 84 150', 'M72 88 V148']} />
      <L d="M48 124 C62 136 82 136 96 124" w={SW} o={0.65} />
    </SvgFrame>
  )
}

export function IllustForearm() {
  return (
    <SvgFrame className="mg-illust--forearm">
      <L d="M56 10 C72 4 92 10 104 28 L128 86 C134 106 128 128 110 148 L94 170 C88 176 74 176 68 168 L44 126 C36 110 34 88 46 68 L56 28 Z" w={SW_BOLD} o={0.95} />
      <L d="M68 30 C80 62 92 102 104 142" w={SW_MID} o={0.82} />
      <L d="M80 24 C92 58 104 98 116 136" w={SW} o={0.75} />
      <Fan o={0.55} paths={['M62 40 C74 70 86 108 96 138', 'M58 52 C70 82 82 118 92 146', 'M66 64 C78 94 90 126 98 150', 'M88 36 C100 66 112 100 122 130', 'M84 48 C96 78 108 110 118 138']} />
      <L d="M74 152 C84 158 96 158 108 148" w={SW} o={0.7} />
    </SvgFrame>
  )
}

export function IllustTraps() {
  return (
    <SvgFrame className="mg-illust--traps">
      <L d="M68 6 H92 V28 C92 36 86 42 80 42 C74 42 68 36 68 28 Z" w={SW} o={0.8} />
      <L d="M24 58 C42 36 60 28 80 28 C100 28 118 36 136 58 L146 80 C150 94 140 108 122 116 L100 126 H60 L38 116 C20 108 10 94 14 80 Z" w={SW_BOLD} o={0.95} />
      <L d="M80 42 V126" w={SW_MID} o={0.82} />
      <Fan o={0.58} paths={['M80 34 L128 68', 'M80 40 L118 72', 'M80 46 L108 74', 'M80 34 L32 68', 'M80 40 L42 72', 'M80 46 L52 74']} />
      <L d="M46 78 H114" w={SW_MID} o={0.85} />
      <L d="M50 90 H110" w={SW} o={0.75} />
      <Fan o={0.5} paths={['M52 84 H108', 'M54 96 H106']} />
      <L d="M58 100 L80 148 L102 100" w={SW_MID} o={0.85} />
      <Fan o={0.5} paths={['M62 108 L80 140', 'M98 108 L80 140', 'M66 118 L80 136', 'M94 118 L80 136']} />
    </SvgFrame>
  )
}

export function IllustCalves() {
  return (
    <SvgFrame className="mg-illust--calves">
      <L d="M44 8 H66 V48 C66 72 56 100 50 126 C46 144 50 158 60 174 H38 C32 154 32 138 38 120 C44 90 44 64 44 48 Z" w={SW_BOLD} o={0.95} />
      <L d="M94 8 H116 V48 C116 72 126 100 132 126 C136 144 132 158 122 174 H100 C110 154 114 138 108 120 C102 90 94 64 94 48 Z" w={SW_BOLD} o={0.95} />
      <L d="M48 28 C52 46 48 68 44 90" w={SW_MID} o={0.85} />
      <L d="M62 28 C58 46 54 68 52 90" w={SW_MID} o={0.85} />
      <L d="M98 28 C102 46 106 68 108 90" w={SW_MID} o={0.85} />
      <L d="M112 28 C108 46 104 68 100 90" w={SW_MID} o={0.85} />
      <Fan o={0.52} paths={['M50 38 C54 56 50 76 46 94', 'M60 38 C56 56 52 76 50 94', 'M110 38 C106 56 102 76 98 94', 'M100 38 C104 56 108 76 110 94']} />
      <L d="M46 98 C50 124 54 148 58 168" w={SW} o={0.7} />
      <L d="M114 98 C110 124 106 148 102 168" w={SW} o={0.7} />
      <L d="M48 156 H58 M102 156 H112" w={SW} o={0.75} />
    </SvgFrame>
  )
}

export function IllustFunctional() {
  return (
    <SvgFrame className="mg-illust--functional">
      <L d="M70 6 C70 -2 90 -2 90 6 C90 16 80 22 80 22 C80 22 70 16 70 6 Z" w={SW} o={0.85} />
      <L d="M80 22 V74" w={SW_BOLD} o={0.9} />
      <L d="M80 48 H28 M80 48 H132" w={SW_MID} o={0.85} />
      <L d="M28 48 L16 90 M132 48 L144 90" w={SW} o={0.8} />
      <L d="M80 74 L48 124 M80 74 L112 124" w={SW_MID} o={0.85} />
      <L d="M48 124 L38 170 M112 124 L122 170" w={SW} o={0.8} />
      <L d="M72 46 C76 42 84 42 88 46 C84 50 76 50 72 46 Z" w={SW_FINE} o={0.7} />
      <L d="M72 72 C76 68 84 68 88 72 C84 76 76 76 72 72 Z" w={SW_FINE} o={0.7} />
      <L d="M42 122 C46 118 54 118 58 122 C54 126 46 126 42 122 Z" w={SW_FINE} o={0.65} />
      <L d="M102 122 C106 118 114 118 118 122 C114 126 106 126 102 122 Z" w={SW_FINE} o={0.65} />
      <Fan o={0.5} paths={['M60 58 C52 64 44 70 36 72', 'M100 58 C108 64 116 70 124 72', 'M68 90 C58 104 50 116 46 124', 'M92 90 C102 104 110 116 114 124']} />
    </SvgFrame>
  )
}

export function IllustStretch() {
  return (
    <SvgFrame className="mg-illust--stretch">
      <L d="M92 4 C100 4 106 10 106 18 C106 26 100 32 92 32 C84 32 78 26 78 18 C78 10 84 4 92 4 Z" w={SW} o={0.85} />
      <L d="M92 32 C82 56 64 78 42 94" w={SW_BOLD} o={0.9} />
      <L d="M76 58 C96 44 122 34 144 30" w={SW_MID} o={0.85} />
      <L d="M144 30 L156 52" w={SW} o={0.75} />
      <L d="M54 88 C42 116 36 142 44 170" w={SW_MID} o={0.85} />
      <L d="M60 92 C76 116 88 142 92 170" w={SW_MID} o={0.85} />
      <Fan o={0.5} paths={['M86 40 C76 60 60 80 44 92', 'M88 50 C96 58 116 48 136 38', 'M50 104 C44 128 42 148 48 166', 'M66 106 C76 128 86 150 90 166']} />
    </SvgFrame>
  )
}

const ILLUSTRATION_MAP = {
  chest: IllustChest,
  back: IllustBack,
  legs: IllustLegs,
  glutes: IllustGlutes,
  shoulders: IllustShoulders,
  biceps: IllustBiceps,
  triceps: IllustTriceps,
  abs: IllustAbs,
  'lower-back': IllustLowerBack,
  cardio: IllustCardio,
  mobility: IllustMobility,
  forearm: IllustForearm,
  traps: IllustTraps,
  calves: IllustCalves,
  functional: IllustFunctional,
  stretch: IllustStretch,
}

export function MuscleGroupIllustration({ name, className = '' }) {
  const Comp = ILLUSTRATION_MAP[name] || IllustChest
  return (
    <span className={`mg-illust-wrap ${className}`.trim()}>
      <Comp />
    </span>
  )
}

export { ILLUSTRATION_MAP }
