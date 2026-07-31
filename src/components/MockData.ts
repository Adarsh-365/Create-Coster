// ─────────────────────────────────────────────────────────────────────────────
// MANIM STUDIO — Professional SaaS Mock Data
// ─────────────────────────────────────────────────────────────────────────────

import type { Project, ManimScene, ProjectSettings } from './Types';

const DEFAULT_SETTINGS: ProjectSettings = {
  resolution: '1080p',
  fps: 60,
  qualityFlag: '-qh',
  aspectRatio: '16:9',
  backgroundColor: '#09090b',
  voiceModel: 'en-US-Neural2-F',
};

const BINARY_SEARCH_CODE = `from manim import *

class BinarySearchScene(Scene):
    def construct(self):
        # Configure theme background
        self.camera.background_color = "#09090b"

        title = Text("Binary Search Algorithm", font_size=40, weight=BOLD)
        title.set_color(BLUE_D)
        self.play(Write(title))
        self.wait(0.5)
        self.play(title.animate.to_edge(UP, buff=0.5))

        # Render sorted array
        nums = [2, 5, 8, 12, 16, 23, 38, 45]
        squares = VGroup(*[
            Square(side_length=0.75).set_fill("#18181b", opacity=0.9).set_stroke("#3f3f46", width=1.5)
            for _ in nums
        ]).arrange(RIGHT, buff=0.1)

        labels = VGroup(*[
            Text(str(n), font_size=20, font="JetBrains Mono").move_to(sq)
            for n, sq in zip(nums, squares)
        ])

        array_group = VGroup(squares, labels).move_to(ORIGIN)
        self.play(FadeIn(array_group, shift=DOWN * 0.3))
        self.wait(0.8)

        # Highlight mid element pointer
        mid_idx = 3
        mid_arrow = Arrow(UP * 1.2, squares[mid_idx].get_top(), color=YELLOW, buff=0.1)
        mid_label = Text("mid [idx: 3]", font_size=16, color=YELLOW).next_to(mid_arrow, UP, buff=0.1)

        self.play(GrowArrow(mid_arrow), Write(mid_label))
        self.play(squares[mid_idx].animate.set_stroke("#eab308", width=2.5))
        self.wait(1.2)`;

const TWO_SUM_CODE = `from manim import *

class TwoSumProblem(Scene):
    def construct(self):
        self.camera.background_color = "#09090b"

        header = Text("Two Sum — Hash Map Solution", font_size=36, weight=BOLD)
        header.set_color(BLUE_C)
        self.play(FadeIn(header, shift=DOWN * 0.2))
        self.play(header.animate.to_edge(UP, buff=0.4))

        # Problem specifications
        nums_val = [2, 7, 11, 15]
        target_val = 9

        info_box = VGroup(
            Text(f"nums = {nums_val}", font_size=20, font="JetBrains Mono"),
            Text(f"target = {target_val}", font_size=20, color=GREEN_C, font="JetBrains Mono"),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.2).to_edge(LEFT, buff=0.8)

        self.play(Write(info_box))
        self.wait(1.0)`;

const SORTING_CODE = `from manim import *

class SortingComparison(Scene):
    def construct(self):
        self.camera.background_color = "#09090b"

        title = Text("Merge Sort vs Quick Sort", font_size=38, weight=BOLD)
        self.play(Write(title))
        self.play(title.animate.to_edge(UP, buff=0.5))

        values = [42, 18, 75, 23, 89, 56, 11, 64]
        bars = VGroup(*[
            Rectangle(
                width=0.5,
                height=v / 25,
                color=BLUE_E
            ).set_fill("#2563eb", opacity=0.85).set_stroke("#60a5fa", width=1)
            for v in values
        ]).arrange(RIGHT, buff=0.15, aligned_edge=DOWN).move_to(ORIGIN)

        self.play(Create(bars))
        self.wait(1.5)`;

function makeLogs(sceneNum: number, filename: string): string[] {
  return [
    `[INFO] Manim Community v0.18.0 initialized`,
    `[INFO] Inspecting Python file: src/scenes/${filename}`,
    `[INFO] Compiling class BinarySearchScene...`,
    `[INFO] Rendering Frame 001/450 (0%) - 60 FPS`,
    `[INFO] Rendering Frame 180/450 (40%) - GPU Acceleration active`,
    `[INFO] Rendering Frame 360/450 (80%) - Applying camera transitions`,
    `[SUCCESS] Rendered Scene ${sceneNum} to media/videos/1080p60/${filename.replace('.py', '.mp4')}`,
  ];
}

function makeScene(
  n: number,
  title: string,
  description: string,
  duration: string,
  durationSeconds: number,
  status: ManimScene['status'],
  filename: string,
  renderProgress: number,
  script: string,
  code: string,
  errorMessage?: string
): ManimScene {
  return {
    id: `scene-${n}`,
    number: n,
    title,
    description,
    duration,
    durationSeconds,
    status,
    filename,
    renderProgress,
    script,
    code,
    consoleLogs: makeLogs(n, filename),
    errorMessage,
  };
}

const BINARY_SEARCH_SCENES: ManimScene[] = [
  makeScene(
    1, 'Problem Introduction', 'Introducing the binary search problem with an animated sorted array.',
    '00:42', 42, 'rendered', 'scene_01.py', 100,
    'Welcome to our overview of Binary Search. Imagine searching for an item in a sorted list. Rather than checking every element, we halve the search space at each step.',
    BINARY_SEARCH_CODE
  ),
  makeScene(
    2, 'Divide & Conquer Principle', 'Visualizing the left/right pointer narrowing mechanism.',
    '00:38', 38, 'rendered', 'scene_02.py', 100,
    'By evaluating the middle element against our target, we instantly eliminate half of the remaining array. This turns linear time into logarithmic time.',
    BINARY_SEARCH_CODE
  ),
  makeScene(
    3, 'Python Implementation', 'Walking through left, right, and mid pointer calculations.',
    '00:55', 55, 'rendering', 'scene_03.py', 67,
    'Now let\'s inspect the code. We initialize left at index zero and right at the final index. At each iteration, mid is calculated safely to avoid integer overflow.',
    BINARY_SEARCH_CODE
  ),
  makeScene(
    4, 'Complexity Proof O(log n)', 'Mathematical proof showing logarithmic step decay.',
    '00:48', 48, 'queued', 'scene_04.py', 0,
    'Why is binary search O(log n)? With n elements, after k steps we have n over 2 to the power of k. Solving for k equals 1 yields k = log2(n).',
    BINARY_SEARCH_CODE
  ),
  makeScene(
    5, 'Edge Cases & Guards', 'Handling single-element arrays, missing targets, and duplicates.',
    '00:35', 35, 'pending', 'scene_05.py', 0,
    'Edge cases require careful pointer boundary condition checks, especially when left equals right or target falls outside array bounds.',
    BINARY_SEARCH_CODE
  ),
];

const TWO_SUM_SCENES: ManimScene[] = [
  makeScene(
    1, 'Problem Breakdown', 'Explaining the Two Sum problem with visual array inputs.',
    '00:45', 45, 'rendered', 'scene_01.py', 100,
    'Given an integer array and a target value, we need to return indices of two numbers that add up to target.',
    TWO_SUM_CODE
  ),
  makeScene(
    2, 'Brute Force vs Hash Map', 'Comparing O(n²) double loop against O(n) hash table lookup.',
    '00:52', 52, 'rendered', 'scene_02.py', 100,
    'Instead of testing every pair with nested loops, we store seen values in a hash map for instant lookup of complements.',
    TWO_SUM_CODE
  ),
  makeScene(
    3, 'Hash Table Step-by-step', 'Animated dictionary inserts and complement matching.',
    '00:40', 40, 'failed', 'scene_03.py', 30,
    'As we traverse the list, we compute target minus current value and check if it exists in our dictionary.',
    TWO_SUM_CODE,
    'ManimError: LaTeX rendering failed due to missing packages.'
  ),
];

const SORTING_SCENES: ManimScene[] = [
  makeScene(1, 'Algorithm Overview', 'Introduction to visual sorting efficiency.', '00:30', 30, 'rendered', 'scene_01.py', 100, 'Sorting forms the bedrock of database indexes and algorithmic optimization.', SORTING_CODE),
  makeScene(2, 'Merge Sort Divide', 'Recursive splitting of sub-arrays.', '00:55', 55, 'rendered', 'scene_02.py', 100, 'Merge sort divides the array until sub-arrays reach length one.', SORTING_CODE),
  makeScene(3, 'Quick Sort Partitioning', 'Lomuto partition scheme with pivot visualization.', '00:65', 65, 'rendering', 'scene_03.py', 42, 'Quick sort picks a pivot element and partitions smaller items left, larger items right.', SORTING_CODE),
  makeScene(4, 'Benchmark & Big-O Summary', 'Side-by-side performance bar graph.', '00:45', 45, 'pending', 'scene_04.py', 0, 'Comparing average vs worst-case time complexities across sorting algorithms.', SORTING_CODE),
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Binary Search Algorithm',
    prompt: 'Create an educational video explaining Binary Search with animated array pointers and O(log n) complexity proof.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    totalDuration: '03:58',
    totalScenes: BINARY_SEARCH_SCENES.length,
    generationPhase: 'rendering',
    settings: DEFAULT_SETTINGS,
    scenes: BINARY_SEARCH_SCENES,
  },
  {
    id: 'proj-2',
    title: 'Two Sum Problem Breakdown',
    prompt: 'Explain Two Sum LeetCode problem using animated hash map lookups.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    totalDuration: '02:17',
    totalScenes: TWO_SUM_SCENES.length,
    generationPhase: 'error',
    settings: DEFAULT_SETTINGS,
    scenes: TWO_SUM_SCENES,
  },
  {
    id: 'proj-3',
    title: 'Sorting Algorithms Masterclass',
    prompt: 'Visual comparison of Merge Sort vs Quick Sort with animated bar charts.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    totalDuration: '03:15',
    totalScenes: SORTING_SCENES.length,
    generationPhase: 'done',
    settings: DEFAULT_SETTINGS,
    scenes: SORTING_SCENES,
  },
];

export async function simulateProjectGeneration(
  prompt: string,
  onPhaseChange: (phase: string) => void,
  onScenesReady: (scenes: ManimScene[]) => void
): Promise<void> {
  const phases = ['planning', 'breakdown', 'codegen', 'rendering'];

  for (const phase of phases) {
    onPhaseChange(phase);
    await new Promise(r => setTimeout(r, 1400));
  }

  const title = prompt.length > 36 ? prompt.substring(0, 36) + '...' : prompt;
  const generatedScenes: ManimScene[] = [
    makeScene(1, 'Scene Overview', `Introductory scene for: ${title}`, '00:35', 35, 'rendered', 'scene_01.py', 100, `In this video, we break down: ${prompt}`, BINARY_SEARCH_CODE),
    makeScene(2, 'Core Visualization', 'Main animation breakdown.', '00:50', 50, 'rendered', 'scene_02.py', 100, 'Step-by-step visual animation of the core concepts.', BINARY_SEARCH_CODE),
    makeScene(3, 'Code Walkthrough', 'Python Manim execution.', '00:45', 45, 'rendering', 'scene_03.py', 60, 'Examining the underlying implementation details.', BINARY_SEARCH_CODE),
    makeScene(4, 'Summary', 'Recap and key insights.', '00:30', 30, 'queued', 'scene_04.py', 0, 'Summarizing key takeaways.', BINARY_SEARCH_CODE),
  ];

  onScenesReady(generatedScenes);
  onPhaseChange('done');
}
