import 'dart:ui';

/// Simplified single-line ("skeleton") stroke data for uppercase print
/// letters A-Z, in standard elementary manuscript stroke order.
///
/// Each letter maps to an ordered list of strokes; each stroke is an
/// ordered list of points describing the path a pencil/finger travels.
/// Coordinates are normalized to a 100x100 unit square (x right, y down)
/// and must be scaled to the actual canvas size at paint time.
///
/// This is centerline data for tracing guidance, not a decorative font --
/// curves are approximated with enough straight segments to read cleanly
/// at typical mobile sizes.
final Map<String, List<List<Offset>>> letterStrokes =
    <String, List<List<Offset>>>{
      'A': <List<Offset>>[
        <Offset>[const Offset(50, 10), const Offset(10, 90)],
        <Offset>[const Offset(50, 10), const Offset(90, 90)],
        <Offset>[const Offset(26, 60), const Offset(74, 60)],
      ],
      'B': <List<Offset>>[
        <Offset>[const Offset(20, 10), const Offset(20, 90)],
        <Offset>[
          const Offset(20, 10),
          const Offset(55, 10),
          const Offset(66, 20),
          const Offset(66, 35),
          const Offset(55, 46),
          const Offset(20, 46),
        ],
        <Offset>[
          const Offset(20, 46),
          const Offset(60, 46),
          const Offset(72, 58),
          const Offset(72, 78),
          const Offset(60, 90),
          const Offset(20, 90),
        ],
      ],
      'C': <List<Offset>>[
        <Offset>[
          const Offset(78, 22),
          const Offset(58, 10),
          const Offset(32, 14),
          const Offset(15, 32),
          const Offset(11, 50),
          const Offset(15, 68),
          const Offset(32, 86),
          const Offset(58, 90),
          const Offset(78, 78),
        ],
      ],
      'D': <List<Offset>>[
        <Offset>[const Offset(20, 10), const Offset(20, 90)],
        <Offset>[
          const Offset(20, 10),
          const Offset(50, 10),
          const Offset(72, 22),
          const Offset(80, 50),
          const Offset(72, 78),
          const Offset(50, 90),
          const Offset(20, 90),
        ],
      ],
      'E': <List<Offset>>[
        <Offset>[const Offset(22, 10), const Offset(22, 90)],
        <Offset>[const Offset(22, 10), const Offset(78, 10)],
        <Offset>[const Offset(22, 50), const Offset(62, 50)],
        <Offset>[const Offset(22, 90), const Offset(78, 90)],
      ],
      'F': <List<Offset>>[
        <Offset>[const Offset(22, 10), const Offset(22, 90)],
        <Offset>[const Offset(22, 10), const Offset(78, 10)],
        <Offset>[const Offset(22, 50), const Offset(62, 50)],
      ],
      'G': <List<Offset>>[
        <Offset>[
          const Offset(78, 22),
          const Offset(58, 10),
          const Offset(32, 14),
          const Offset(15, 32),
          const Offset(11, 50),
          const Offset(15, 68),
          const Offset(32, 86),
          const Offset(58, 90),
          const Offset(78, 78),
          const Offset(78, 55),
          const Offset(52, 55),
        ],
      ],
      'H': <List<Offset>>[
        <Offset>[const Offset(20, 10), const Offset(20, 90)],
        <Offset>[const Offset(80, 10), const Offset(80, 90)],
        <Offset>[const Offset(20, 50), const Offset(80, 50)],
      ],
      'I': <List<Offset>>[
        <Offset>[const Offset(50, 10), const Offset(50, 90)],
      ],
      'J': <List<Offset>>[
        <Offset>[
          const Offset(68, 10),
          const Offset(68, 65),
          const Offset(62, 82),
          const Offset(46, 90),
          const Offset(30, 84),
          const Offset(20, 72),
        ],
      ],
      'K': <List<Offset>>[
        <Offset>[const Offset(20, 10), const Offset(20, 90)],
        <Offset>[const Offset(76, 10), const Offset(20, 52)],
        <Offset>[const Offset(20, 52), const Offset(76, 90)],
      ],
      'L': <List<Offset>>[
        <Offset>[const Offset(22, 10), const Offset(22, 90)],
        <Offset>[const Offset(22, 90), const Offset(74, 90)],
      ],
      'M': <List<Offset>>[
        <Offset>[
          const Offset(14, 90),
          const Offset(14, 10),
          const Offset(50, 55),
          const Offset(86, 10),
          const Offset(86, 90),
        ],
      ],
      'N': <List<Offset>>[
        <Offset>[
          const Offset(20, 90),
          const Offset(20, 10),
          const Offset(80, 90),
          const Offset(80, 10),
        ],
      ],
      'O': <List<Offset>>[
        <Offset>[
          const Offset(50, 10),
          const Offset(25, 15),
          const Offset(12, 35),
          const Offset(10, 50),
          const Offset(12, 65),
          const Offset(25, 85),
          const Offset(50, 90),
          const Offset(75, 85),
          const Offset(88, 65),
          const Offset(90, 50),
          const Offset(88, 35),
          const Offset(75, 15),
          const Offset(50, 10),
        ],
      ],
      'P': <List<Offset>>[
        <Offset>[const Offset(20, 10), const Offset(20, 90)],
        <Offset>[
          const Offset(20, 10),
          const Offset(56, 10),
          const Offset(70, 22),
          const Offset(70, 37),
          const Offset(56, 48),
          const Offset(20, 48),
        ],
      ],
      'Q': <List<Offset>>[
        <Offset>[
          const Offset(50, 10),
          const Offset(25, 15),
          const Offset(12, 35),
          const Offset(10, 50),
          const Offset(12, 65),
          const Offset(25, 85),
          const Offset(50, 90),
          const Offset(75, 85),
          const Offset(88, 65),
          const Offset(90, 50),
          const Offset(88, 35),
          const Offset(75, 15),
          const Offset(50, 10),
        ],
        <Offset>[const Offset(58, 62), const Offset(86, 92)],
      ],
      'R': <List<Offset>>[
        <Offset>[const Offset(20, 10), const Offset(20, 90)],
        <Offset>[
          const Offset(20, 10),
          const Offset(56, 10),
          const Offset(70, 22),
          const Offset(70, 37),
          const Offset(56, 48),
          const Offset(20, 48),
        ],
        <Offset>[const Offset(38, 48), const Offset(76, 90)],
      ],
      'S': <List<Offset>>[
        <Offset>[
          const Offset(76, 22),
          const Offset(56, 10),
          const Offset(32, 12),
          const Offset(19, 25),
          const Offset(21, 38),
          const Offset(38, 48),
          const Offset(62, 55),
          const Offset(80, 66),
          const Offset(81, 79),
          const Offset(66, 89),
          const Offset(36, 90),
          const Offset(16, 79),
        ],
      ],
      'T': <List<Offset>>[
        <Offset>[const Offset(15, 10), const Offset(85, 10)],
        <Offset>[const Offset(50, 10), const Offset(50, 90)],
      ],
      'U': <List<Offset>>[
        <Offset>[
          const Offset(20, 10),
          const Offset(20, 60),
          const Offset(26, 80),
          const Offset(46, 90),
          const Offset(62, 87),
          const Offset(74, 72),
          const Offset(76, 55),
          const Offset(76, 10),
        ],
      ],
      'V': <List<Offset>>[
        <Offset>[const Offset(14, 10), const Offset(50, 90)],
        <Offset>[const Offset(50, 90), const Offset(86, 10)],
      ],
      'W': <List<Offset>>[
        <Offset>[
          const Offset(8, 10),
          const Offset(28, 90),
          const Offset(50, 45),
          const Offset(72, 90),
          const Offset(92, 10),
        ],
      ],
      'X': <List<Offset>>[
        <Offset>[const Offset(15, 10), const Offset(85, 90)],
        <Offset>[const Offset(85, 10), const Offset(15, 90)],
      ],
      'Y': <List<Offset>>[
        <Offset>[const Offset(14, 10), const Offset(50, 52)],
        <Offset>[const Offset(86, 10), const Offset(50, 52)],
        <Offset>[const Offset(50, 52), const Offset(50, 90)],
      ],
      'Z': <List<Offset>>[
        <Offset>[const Offset(15, 10), const Offset(85, 10)],
        <Offset>[const Offset(85, 10), const Offset(15, 90)],
        <Offset>[const Offset(15, 90), const Offset(85, 90)],
      ],
    };
