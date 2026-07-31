import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/theme/tokens.dart';
import '../../core/widgets/kid_button.dart';

/// Parent gate: long-press + arithmetic with cooldown.
class ParentGatePage extends StatefulWidget {
  const ParentGatePage({super.key});

  @override
  State<ParentGatePage> createState() => _ParentGatePageState();
}

class _ParentGatePageState extends State<ParentGatePage> {
  int _failures = 0;
  bool _coolingDown = false;
  int _cooldownRemaining = 0;
  Timer? _cooldownTimer;

  int _num1 = 0;
  int _num2 = 0;
  int _correctAnswer = 0;
  List<int> _choices = <int>[];

  @override
  void initState() {
    super.initState();
    _loadCooldown();
    _generateArithmetic();
  }

  @override
  void dispose() {
    _cooldownTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadCooldown() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final int cooldownEnd = prefs.getInt('parent_gate.cooldown_end') ?? 0;
    final int now = DateTime.now().millisecondsSinceEpoch;
    if (cooldownEnd > now) {
      _startCooldown(((cooldownEnd - now) / 1000).ceil());
    }
  }

  void _startCooldown(int seconds) {
    setState(() {
      _coolingDown = true;
      _cooldownRemaining = seconds;
    });
    _cooldownTimer?.cancel();
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (Timer timer) {
      setState(() {
        _cooldownRemaining--;
      });
      if (_cooldownRemaining <= 0) {
        timer.cancel();
        setState(() => _coolingDown = false);
      }
    });
  }

  void _generateArithmetic() {
    final Random rng = Random();
    _num1 = rng.nextInt(9) + 1;
    _num2 = rng.nextInt(9) + 1;
    _correctAnswer = _num1 + _num2;

    final Set<int> uniqueChoices = <int>{_correctAnswer};
    while (uniqueChoices.length < 3) {
      uniqueChoices.add(_correctAnswer + rng.nextInt(5) - 2);
    }
    _choices = uniqueChoices.toList()..shuffle(rng);
  }

  void _onArithmeticSelect(int answer) {
    if (_coolingDown) return;

    if (answer == _correctAnswer) {
      context.go('/parent');
    } else {
      setState(() => _failures++);
      if (_failures >= 3) {
        final int cooldownEnd = DateTime.now().millisecondsSinceEpoch + 30000;
        SharedPreferences.getInstance().then(
          (SharedPreferences prefs) =>
              prefs.setInt('parent_gate.cooldown_end', cooldownEnd),
        );
        _startCooldown(30);
        setState(() => _failures = 0);
      } else {
        _generateArithmetic();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    const Color textColor = Colors.black87;

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: SafeArea(
        // Scroll instead of overflowing at large system text scale
        // (ACCESSIBILITY.md: no overflow at 200%) -- this page was never
        // given the scroll-safety wrapper the rest of the app uses, and
        // was passing only by a thin margin until content grew slightly.
        child: LayoutBuilder(
          builder: (BuildContext context, BoxConstraints constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.all(Space.xl),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Icon(
                        Icons.lock_rounded,
                        size: 64,
                        color: textColor.withValues(alpha: 0.5),
                      ),
                      const SizedBox(height: Space.lg),
                      if (_coolingDown) ...[
                        Text(
                          'Please wait $_cooldownRemaining seconds',
                          style: const TextStyle(
                            fontFamily: 'Nunito',
                            fontSize: 18,
                            color: Colors.black54,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: Space.lg),
                        LinearProgressIndicator(
                          value: _cooldownRemaining / 30,
                          backgroundColor: Colors.grey.shade200,
                        ),
                      ] else ...[
                        const Text(
                          'Hold 3 seconds or solve:',
                          style: TextStyle(
                            fontFamily: 'Nunito',
                            fontSize: 18,
                            color: textColor,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: Space.md),
                        GestureDetector(
                          onLongPress: () {
                            if (!_coolingDown) context.go('/parent');
                          },
                          child: Container(
                            width: 200,
                            height: 60,
                            decoration: BoxDecoration(
                              color: Colors.blue.shade100,
                              borderRadius: BorderRadius.circular(KidRadius.md),
                            ),
                            child: const Center(
                              child: Text(
                                'Long press here',
                                style: TextStyle(
                                  fontFamily: 'Nunito',
                                  fontSize: 16,
                                  color: Colors.blue,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                      const SizedBox(height: Space.lg),
                      Text(
                        '$_num1 + $_num2 = ?',
                        style: const TextStyle(
                          fontFamily: 'Nunito',
                          fontSize: 32,
                          color: textColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: Space.md),
                      Wrap(
                        spacing: Space.md,
                        children: _choices.map((int choice) {
                          return KidButton(
                            onPressed: () => _onArithmeticSelect(choice),
                            semanticsLabel: 'Answer $choice',
                            variant: KidVariant.secondary,
                            child: Text(
                              '$choice',
                              style: const TextStyle(fontSize: 24),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
