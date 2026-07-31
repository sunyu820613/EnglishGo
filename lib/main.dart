import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app/router.dart';
import 'core/theme/theme_controller.dart';
import 'core/theme/validate_theme_assets.dart';
import 'data/progress/progress_repository.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Global error handler — child-friendly, no red screen.
  ErrorWidget.builder = (FlutterErrorDetails details) {
    // In debug mode still show details, in release show friendly fallback.
    return const Material(
      color: Colors.white,
      child: Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Icon(Icons.face_rounded, size: 64, color: Colors.grey),
              SizedBox(height: 16),
              Text(
                'Oops! Something went wrong.\nPlease restart the app.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Nunito',
                  fontSize: 18,
                  color: Colors.black54,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  };

  // Catch unhandled errors so the app doesn't crash.
  PlatformDispatcher.instance.onError = (Object error, StackTrace stack) {
    // ignore: avoid_print
    debugPrint('[EnglishGo] Unhandled error: $error');
    return true; // Prevent crash.
  };

  runApp(const ProviderScope(child: EnglishGoApp()));
}

class EnglishGoApp extends ConsumerStatefulWidget {
  const EnglishGoApp({super.key});

  @override
  ConsumerState<EnglishGoApp> createState() => _EnglishGoAppState();
}

class _EnglishGoAppState extends ConsumerState<EnglishGoApp> {
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    // Load persisted theme
    await ref.read(themeControllerProvider.notifier).loadTheme();

    // Load progress
    await ref.read(progressProvider.notifier).loadProgress();

    // Validate theme assets in debug mode
    assert(() {
      validateThemeAssets(rootBundle);
      return true;
    }());

    if (mounted) {
      setState(() => _initialized = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_initialized) {
      return const MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Scaffold(
          backgroundColor: Colors.white,
          body: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Icon(Icons.face_rounded, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text(
                  'Loading...',
                  style: TextStyle(
                    fontFamily: 'Nunito',
                    fontSize: 18,
                    color: Colors.black54,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final KidThemeExtension kidTheme = ref.watch(currentThemeProvider);

    return MaterialApp.router(
      title: 'EnglishGo',
      debugShowCheckedModeBanner: false,
      theme: buildThemeData(kidTheme),
      routerConfig: buildRouter(ref),
      // Use Builder to pass MediaQuery with reduced motion
      builder: (BuildContext context, Widget? child) {
        // Apply reduced motion if system setting is enabled
        final bool reducedMotion = MediaQuery.disableAnimationsOf(context);
        Widget result = child ?? const SizedBox.shrink();
        if (reducedMotion) {
          result = MediaQuery(
            data: MediaQuery.of(context).copyWith(disableAnimations: true),
            child: result,
          );
        }
        // DESIGN.md §4: tablet/desktop widths use a centered content
        // column (spec says 720dp for lesson pages; applied app-wide here
        // since every page was stretching edge-to-edge on wide viewports
        // with no cap -- oversized grid cells, off-center layouts). The
        // ColoredBox behind it fills the letterboxed margin with the
        // current theme's background instead of leaving bare white/black.
        return ColoredBox(
          color: kidTheme.background,
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 720),
              child: result,
            ),
          ),
        );
      },
    );
  }
}
