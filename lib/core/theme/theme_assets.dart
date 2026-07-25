// Strongly typed asset path references for one theme.
// Every field maps to a THEME_SYSTEM §2 asset category.
// Paths use the pattern `assets/themes/{themeId}/{category}/`.

class ThemeAssets {
  const ThemeAssets({
    required this.backgroundScene,
    required this.frameDecoration,
    required this.mascot,
    required this.particle,
    required this.celebration,
    required this.rewardChest,
    required this.mapPath,
    required this.sfxSet,
    required this.bgm,
  });

  final String backgroundScene;
  final String frameDecoration;
  final String mascot;
  final String particle;
  final String celebration;
  final String rewardChest;
  final String mapPath;
  final String sfxSet;
  final String bgm;

  /// All non-null asset paths for validation / manifest checking.
  List<String> get allPaths => [
    backgroundScene,
    frameDecoration,
    mascot,
    particle,
    celebration,
    rewardChest,
    mapPath,
    sfxSet,
    bgm,
  ];
}

/// Pre-built theme asset sets keyed by theme id.
class ThemeAssetSets {
  ThemeAssetSets._();

  static const starlight = ThemeAssets(
    backgroundScene: 'assets/themes/starlight/background_scene.webp',
    frameDecoration: 'assets/themes/starlight/frame_decoration.webp',
    mascot: 'assets/themes/starlight/mascot.webp',
    particle: 'assets/themes/starlight/particle.webp',
    celebration: 'assets/themes/starlight/celebration.webp',
    rewardChest: 'assets/themes/starlight/reward_chest.webp',
    mapPath: 'assets/themes/starlight/map_path.webp',
    sfxSet: 'assets/themes/starlight/sfx/',
    bgm: 'assets/themes/starlight/bgm.m4a',
  );

  static const dino = ThemeAssets(
    backgroundScene: 'assets/themes/dino/background_scene.webp',
    frameDecoration: 'assets/themes/dino/frame_decoration.webp',
    mascot: 'assets/themes/dino/mascot.webp',
    particle: 'assets/themes/dino/particle.webp',
    celebration: 'assets/themes/dino/celebration.webp',
    rewardChest: 'assets/themes/dino/reward_chest.webp',
    mapPath: 'assets/themes/dino/map_path.webp',
    sfxSet: 'assets/themes/dino/sfx/',
    bgm: 'assets/themes/dino/bgm.m4a',
  );

  static const robot = ThemeAssets(
    backgroundScene: 'assets/themes/robot/background_scene.webp',
    frameDecoration: 'assets/themes/robot/frame_decoration.webp',
    mascot: 'assets/themes/robot/mascot.webp',
    particle: 'assets/themes/robot/particle.webp',
    celebration: 'assets/themes/robot/celebration.webp',
    rewardChest: 'assets/themes/robot/reward_chest.webp',
    mapPath: 'assets/themes/robot/map_path.webp',
    sfxSet: 'assets/themes/robot/sfx/',
    bgm: 'assets/themes/robot/bgm.m4a',
  );

  static const moonGarden = ThemeAssets(
    backgroundScene: 'assets/themes/moon_garden/background_scene.webp',
    frameDecoration: 'assets/themes/moon_garden/frame_decoration.webp',
    mascot: 'assets/themes/moon_garden/mascot.webp',
    particle: 'assets/themes/moon_garden/particle.webp',
    celebration: 'assets/themes/moon_garden/celebration.webp',
    rewardChest: 'assets/themes/moon_garden/reward_chest.webp',
    mapPath: 'assets/themes/moon_garden/map_path.webp',
    sfxSet: 'assets/themes/moon_garden/sfx/',
    bgm: 'assets/themes/moon_garden/bgm.m4a',
  );

  static const balletCastle = ThemeAssets(
    backgroundScene: 'assets/themes/ballet_castle/background_scene.webp',
    frameDecoration: 'assets/themes/ballet_castle/frame_decoration.webp',
    mascot: 'assets/themes/ballet_castle/mascot.webp',
    particle: 'assets/themes/ballet_castle/particle.webp',
    celebration: 'assets/themes/ballet_castle/celebration.webp',
    rewardChest: 'assets/themes/ballet_castle/reward_chest.webp',
    mapPath: 'assets/themes/ballet_castle/map_path.webp',
    sfxSet: 'assets/themes/ballet_castle/sfx/',
    bgm: 'assets/themes/ballet_castle/bgm.m4a',
  );

  static const dessert = ThemeAssets(
    backgroundScene: 'assets/themes/dessert/background_scene.webp',
    frameDecoration: 'assets/themes/dessert/frame_decoration.webp',
    mascot: 'assets/themes/dessert/mascot.webp',
    particle: 'assets/themes/dessert/particle.webp',
    celebration: 'assets/themes/dessert/celebration.webp',
    rewardChest: 'assets/themes/dessert/reward_chest.webp',
    mapPath: 'assets/themes/dessert/map_path.webp',
    sfxSet: 'assets/themes/dessert/sfx/',
    bgm: 'assets/themes/dessert/bgm.m4a',
  );
}
