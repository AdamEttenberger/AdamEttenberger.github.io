<script setup lang="ts">
import { onUnmounted, onBeforeUnmount, ref, type Ref, computed } from 'vue'
import CodeMirror from '@/components/code-mirror.vue'
import Details from '@/components/details.vue'
import Figure from '@/components/figure.vue'
import Layer from '@/components/layer.vue'
import MatchThreeProperties from '@/content/settings/match_three_properties.vue'
import { bit_width } from '@/util/math'
import Link from '@/components/link.vue'
import Player from '@/components/player.vue'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import {
  Color4Row,
  DividerRow,
  LabelRow,
  NumberRangeRow,
} from '@/util/property_editor/property_types'
import Section from '@/components/section.vue'
import TableOfContents from '@/components/table-of-contents.vue'
import { type IProjectInfo } from '@/types/project_types'
// Pinia Stores
import { useMatchThreeScorecardStore } from '@/stores/match_three_scorecard'
import usePropertyEditorModel, { type IUsePropertyEditorModel } from '@/composables/property_editor_model'
import { PlayerState } from '@/types/player_state'
import useIntersectionObserver from '@/composables/intersection_observer'
import type { IShaderDefinition, IShaderTemplate, ShaderUniformsForPayload } from '@/composables/shaders'
import useFunctionRef, { toComponent, type WeakElement } from '@/composables/function_ref'
import useShaders, { Uniform, UniformType } from '@/composables/shaders'
import type { IFrameContainer } from '@/types/frame_container'
import default_vertex_shader from '@/assets/shaders/default.vert?raw'
import checker_board_fragment_shader from '@/assets/shaders/checker_board.frag?raw'
import focus_reticle_fragment_shader from '@/assets/shaders/focus_reticle.frag?raw'
import { PropertyEmits, PropertyEmitsHandler, type ExtractModelType } from '@/util/property_editor/property_interfaces'
import TabList from '@/components/tabs/tab-list.vue'
import score_particles_gif from '@/assets/projects/match_three/score_particles.gif'

defineProps<IProjectInfo>();

enum DemoKey {
  CheckerBoard = 'checker-board',
  FocusReticle = 'focus-reticle',
};

type ShaderTab = 'gdscript'|'glsl';

const player_states = ref({}) as Ref<Record<DemoKey, PlayerState>>;

const selected_checker_frag = ref<ShaderTab>('gdscript');
const selected_reticle_frag = ref<ShaderTab>('gdscript');

const { observe: mapPlayerIntersectionObserver } = useIntersectionObserver<DemoKey>((key, entry) => {
  player_states.value[key] = entry.isIntersecting
      ? PlayerState.Playing
      : PlayerState.Empty;
});

const player = useFunctionRef<DemoKey>([
  {
    ref(e: undefined|WeakElement, demo_key: DemoKey): void {
      mapPlayerIntersectionObserver(demo_key, toComponent(e, Player)?.$el);
    }
  }
]);

const shader_definitions: Record<DemoKey, IShaderDefinition> = {
  [DemoKey.CheckerBoard]: {
    label: "Checkerboard",
    uniforms: [
      new Uniform(UniformType.vec4, 'uBackgroundColor'),
      new Uniform(UniformType.vec4, 'uEvenColor'),
      new Uniform(UniformType.vec4, 'uOddColor'),
      new Uniform(UniformType.float, 'uGridSize'),
    ],
    sources: {
      vert: {source: default_vertex_shader},
      frag: {source: checker_board_fragment_shader},
    }
  },
  [DemoKey.FocusReticle]: {
    label: "Focus Reticle",
    uniforms: [
      new Uniform(UniformType.float, 'uStrokeWidth'),
      new Uniform(UniformType.float, 'uGap'),
      new Uniform(UniformType.vec4, 'uBackgroundColor'),
      new Uniform(UniformType.vec4, 'uFillColor'),
    ],
    sources: {
      vert: {source: default_vertex_shader},
      frag: {source: focus_reticle_fragment_shader},
    }
  },
};

const shaders = useShaders<DemoKey, DemoKey>(computed(() => player.entries(Player) as Record<DemoKey, IFrameContainer>), shader_definitions);

const shader_editors: Record<DemoKey, IUsePropertyEditorModel> = {
  [DemoKey.CheckerBoard]: usePropertyEditorModel(
    [
      new DividerRow('divider-checker-board', 'Checkerboard'),
      new Color4Row('uBackgroundColor', 'Background Color', [0.392156862745098, 0.5843137254901961, 0.9294117647058824, 1.0]).setCollapsed(true),
      new Color4Row('uEvenColor', 'Even Color', [0.2, 0.2, 0.2, 1.0]).setCollapsed(true),
      new Color4Row('uOddColor', 'Odd Color', [0.3, 0.3, 0.3, 1.0]).setCollapsed(true),
      new NumberRangeRow('uGridSize', 'Grid Size', 8, 1, 100, 1),
    ],
    new PropertyEmitsHandler(onPropertyChanged.bind(null, DemoKey.CheckerBoard))
  ),
  [DemoKey.FocusReticle]: usePropertyEditorModel(
    [
      new DividerRow('divider-focus-reticle', 'Focus Reticle'),
      new NumberRangeRow('uStrokeWidth', 'Stroke Width', 0.15, 0.0, 0.5, 0.001),
      new NumberRangeRow('uGap', 'Gap', 0.3, 0.0, 1.0, 0.001),
      new Color4Row('uBackgroundColor', 'Background Color', [0.392156862745098, 0.5843137254901961, 0.9294117647058824, 1.0]).setCollapsed(true),
      new Color4Row('uFillColor', 'Fill Color', [1.0, 1.0, 1.0, 1.0]).setCollapsed(true),
    ],
    new PropertyEmitsHandler(onPropertyChanged.bind(null, DemoKey.FocusReticle))
  )
};

const gamedata = useMatchThreeScorecardStore();

const bit_editor: IUsePropertyEditorModel = usePropertyEditorModel(
  [
    new DividerRow('game_board.bit_calc', 'Bit Compression Calculator'),
    new NumberRangeRow('game_board.width', 'Width', 8, 1, 100, 1),
    new NumberRangeRow('game_board.height', 'Height', 8, 1, 100, 1),
    new LabelRow('game_board.area', 'Total Area', () => {
      const width = bit_editor.get<number>('game_board.width') ?? 0;
      const height = bit_editor.get<number>('game_board.height') ?? 0;
      return width * height;
    }),
    new NumberRangeRow('game_board.tile_types', 'Tile Types', 7, 1, 256, 1),
    new LabelRow('game_board.bits_per_element', 'Bits per-element', () => {
      const tile_types = bit_editor.get<number>('game_board.tile_types') ?? 0;
      return bit_width(tile_types - 1);
    }),
    new LabelRow('game_board.packed_bytes_total', 'Total Packed Bytes', () => {
      const area = bit_editor.get<number>('game_board.area') ?? 0;
      const bits_per_element = bit_editor.get<number>('game_board.bits_per_element') ?? 0;
      return Math.ceil((area * bits_per_element) / 8.0);
    }),
    new LabelRow('game_board.saved_bytes_total', 'Total Bytes Saved', () => {
      const area = bit_editor.get<number>('game_board.area') ?? 0;
      const packed_bytes_total = bit_editor.get<number>('game_board.packed_bytes_total') ?? 0;
      return area - packed_bytes_total;
    }),
    new LabelRow('game_board.percent_memory_saved', 'Percent Memory Saved', () => {
      const area = bit_editor.get<number>('game_board.area') ?? 0;
      const saved_bytes_total = bit_editor.get<number>('game_board.saved_bytes_total') ?? 0;
      return `${Math.floor((saved_bytes_total / area) * 100)}%`;
    }),
  ]
);

function on_game_message(frame: HTMLIFrameElement, event: MessageEvent) {
  if (event.origin !== window.location.origin) {
    return;
  }
  switch (event.data.type) {
    case 'ready':
      if (gamedata.scorecard) {
        frame.contentWindow?.postMessage({'scorecard': JSON.stringify(gamedata.scorecard)}, window.location.origin);
      }
      break;
    case 'scorecard':
      gamedata.scorecard = JSON.parse(event.data.scorecard);
      break;
  }
}

const message_controller = new AbortController();
function bindGodotBridge(frame: HTMLIFrameElement) {
  window.addEventListener('message', on_game_message.bind(null, frame), { signal: message_controller.signal });
}

function postMessageWithPropertyEditor(demo_key: DemoKey) {
  const editor = shader_editors[demo_key];
  const shader_def = shaders.getAssociatedShaderDef(demo_key);
  if (!editor || !shader_def) {
    return;
  }
  const payload: ShaderUniformsForPayload = shader_def.uniforms.reduce(
    (result, uniform) => {
      result.push([uniform.name, { type: uniform.type, value: editor.get(uniform.name) }]);
      return result;
    }, <ShaderUniformsForPayload>[]);

  shaders.update(demo_key, payload);
}

function onShaderFrameLoaded(demo_key: DemoKey): void {
  shaders.bind(demo_key, demo_key);
  postMessageWithPropertyEditor(demo_key);
}

function onPropertyChanged(demo_key: DemoKey, kind: PropertyEmits, _name: string, _new_value?: unknown) {
  if (kind === PropertyEmits.Changed) {
    postMessageWithPropertyEditor(demo_key);
  }
}

onBeforeUnmount(() => {
  message_controller.abort();
})

onUnmounted(() => {
  // Uninstall service workers when leaving, this prevents the browser from caching
  // the last version of the game served when revisiting the page.
  navigator.serviceWorker.getRegistrations().then(registrations => registrations.forEach(item => item.unregister()));
});
</script>

<template>
  <article>
    <Player :title="title"
            :date="date"
            :lastmod="lastmod"
            frame="/library/projects/tile_match/tile_match.html"
            @load="bindGodotBridge" />

    <Section heading="Controls">
      <p>
        This game supports saving your personal scorecard to device local storage.
      </p>
      <MatchThreeProperties />
    </Section>

    <TableOfContents />

    <Section heading="Summary">
      <p>
        A match-3 game in the broadest sense is a game about pattern recognition; find or create groups of similar objects to score points or advance in the game.
        Often a <Link to="https://en.wikipedia.org/wiki/Tile-matching_video_game">tile-matching game</Link> where a "match" can be described as a contiguous segment of at least 3-tiles sharing the same value within a column or row.
      </p>
      <p >
        This game was thrown together in about two weeks as a first attempt at making a short technical demo with the <Link to="https://godotengine.org/">Godot</Link> game engine and its GDScript programming language.
        The code examples on this page are also written in GDScript.
        The 3D models were created with <Link to="https://www.blender.org/">Blender</Link>.
        Sound effects were created with <Link to="https://sfxr.me/">jsfxr (https://sfxr.me/)</Link>.
      </p>
    </Section>

    <Section heading="Goals">
      <p>
        This project is driven by a desire to learn more about building with the Godot game engine and its GDScript programming language.
        I've used both <Link to="https://unity.com/">Unity</Link> and <Link to="https://www.unrealengine.com/">Unreal Engine</Link> for similar experiments, however neither run as smoothly as Godot within resource-constrained environments.
      </p>
      <p>
        While putting this project together there were a few interesting challenges worth mentioning.
        Following will describe the data structures and algorithms used to create this demo, and some insights along the way.
        The intent is not for an optimal solution, but rather a good reference for someone who wants to build a similar game.
        Some performance considerations and a few alternative approaches will be discussed; however, performance isn't the main focus.
      </p>
    </Section>

    <Section heading="Game Board">
      <p>
        There are many ways to represent the game board in memory, however the most common are likely a 1D or 2D <Link to="https://en.wikipedia.org/wiki/Array_(data_structure)">array</Link>.
        Some reasons include <b>O(1)</b> access, excellent <Link to="https://en.wikipedia.org/wiki/Locality_of_reference">cache-locality</Link>, and arrays are easy to reason about with grid-based games.
      </p>
      <p>
        This project represents the game board as 1D array in <Link to="https://en.wikipedia.org/wiki/Row-_and_column-major_order">column-major order</Link> using the GDScript <Link to="https://docs.godotengine.org/en/stable/classes/class_packedint32array.html">PackedInt32Array</Link> class.
        The origin is the lower-left corner of the grid, incrementing first along the y-axis until wrapping at height and incrementing along the x-axis.
      </p>
      <Figure src-light="/images/projects/match_three/column_vs_row_major_light.png"
              src-dark="/images/projects/match_three/column_vs_row_major_dark.png"
              alt="Illustrating the difference between a column-major (left) and row-major (right) matrix indexed as a 1D array." />
      <Details summary="Index transformation methods">
        <CodeMirror lang="gdscript"
                    caption="methods for mapping between 1D flat index and 2D grid location for column and row major grids."
                    content="
          var size: Vector2i;

          func get_index(major_axis: int, pos: Vector2i) -> int:
            return pos[major_axis ^ 1] + (pos[major_axis] * size[major_axis ^ 1]);

          func get_position(major_axis: int, index: int) -> Vector2i:
            var result = Vector2i();
            result[major_axis] = index / size[major_axis];
            result[major_axis ^ 1] = index % size[major_axis];
            return result;

          func get_column_major_index(pos: Vector2i) -> int:
            return pos.y + (pos.x * size.y);

          func get_column_major_position(index: int) -> Vector2i:
            return Vector2i(index / size.y, index % size.y);

          func get_row_major_index(pos: Vector2i) -> int:
            return pos.x + (pos.y * size.x);

          func get_row_major_position(index: int) -> Vector2i:
            return Vector2i(index % size.x, index / size.x);
        " />
      </Details>
      <p>
        This ordering is important since many algorithms, e.g., tiles "falling", may benefit from CPU specific sequential memory optimizations when iterating in column-major ordering.
        Additionally, since the board was designed as an 8x8 grid it <b>could</b> fit comfortably within a single cache line on most systems when each tile is represented with a single byte.
        With a 2D array, depending on the environment and allocation method, in the worst case each column array could be placed on separate cache lines in situations where a 1D array could fit multiple columns.
      </p>
      <p>
        A game board that's 8x8, <b>without bit fiddling</b>, requires only 256 bytes using Godot's <b>PackedInt32Array</b> or 64 bytes with <b>PackedByteArray</b>.
        However, if the target system has <i>extremely</i> limited RAM like many embedded systems or micro-controllers, board information could be compressed by packing the tile information into a binary array where the <b>bits per-element</b> is the smallest power-of-two which can fit the entire range of tile values.
        The <b>compression</b> of multiple states in an <b>encoded</b> array (e.g., multiple values per-byte) unfortunately isn't free, since accessing (reading or writing) each cell becomes more expensive.
      </p>
      <PropertyEditor v-bind:rows="bit_editor.rows" v-model="bit_editor.models" v-on="bit_editor.onPropertyEmit" />
    </Section>

    <Section heading="Core Loop">
      <p>The core game loop is composed of a few simple steps:</p>
      <ol>
        <li>Begin Turn; user input swaps two adjacent tiles.</li>
        <ol>
          <li>Collect matching column and row segments.</li>
          <li>Spawn "score particles" and play sound effects to indicate the value for each match.</li>
          <li>Invalidate any matched tiles.</li>
          <li>Apply "falling" logic to bring invalidated tiles to the top of the board.</li>
          <li>Generate new values for invalidated tiles.</li>
          <li>Play animations to move tiles, then wait until all animations are complete.</li>
          <li>If matches were found this iteration then loop, otherwise end the turn.</li>
        </ol>
        <li>
          End Turn;
          <ol>
            <li>If no matches were found during the turn, undo the initial swap.</li>
            <li>Accumulate turn score.</li>
          </ol>
        </li>
      </ol>
      <p>
        This process can be broken into a few discrete high-level steps:
      </p>
      <ul>
        <li>Swapping</li>
        <li>Matching</li>
        <li>Invalidation</li>
        <li>Particle Effects</li>
        <li>Sound Effects</li>
        <li>Falling</li>
        <li>Randomization</li>
        <li>Animation</li>
      </ul>
      <p>
        To implement the core loop in Godot I used the <b>await</b> keyword so each step executes as one or more <Link to="https://en.wikipedia.org/wiki/Coroutine">coroutines</Link>, a form of single-threaded <Link to="https://en.wikipedia.org/wiki/Cooperative_multitasking">cooperative multitasking</Link>.
      </p>
      <p>
        A <Link to="https://en.wikipedia.org/wiki/Finite-state_machine">finite-state machine</Link> (FSM) would be a great alternative and could be more robust than this coroutine example, however an FSM seemed overly complex and fragile by comparison for this demo.
        With coroutines, all logic can be cleanly organized and scheduled from one function.
        An FSM introduces all the complexity of managing states and state transitions; requiring more code to create, modify, or route new states and state transitions.
      </p>
      <Figure src-light="/images/projects/match_three/core_loop_light.png"
              src-dark="/images/projects/match_three/core_loop_dark.png"
              alt="Illustration of the core game loop." />
      <Details summary="Core game loop logic">
        <CodeMirror lang="gdscript"
                    caption="Core game loop logic"
                    content="
          var _grid: GemGrid;

          func _run_turn(first: Vector2i, second: Vector2i) -> void:
            if _turn_running:
              return;
            _turn_running = true;
            on_turn_start.emit();
            var score: int = 0;
            var combo: int = 0;
            await _swap_tiles(first, second);
            while true:
              var matches: MatchResult = _grid.collect_matches();
              if matches.is_empty():
                if combo == 0:
                  await _swap_tiles(first, second);
                break;

              score += matches.total_score();
              combo += matches.regions().size();
              await _animator.play_matched(matches);

              var invalidation_result: InvalidationResult = _grid.invalidate_regions(matches);
              _grid.apply_falling(invalidation_result);
              _grid.populate();
              _grid.reset_transforms(invalidation_result);
              await _animator.play_falling(invalidation_result);

            _turn_running = false;
            on_turn_end.emit(score, combo);
          " />
        </Details>
    </Section>

    <Section heading="Matching">
      <p>
        To match tiles, iterate over independent columns and rows, collecting any slices where at least 3 consecutive tiles share the same type.
        It's important that tile values are immutable throughout this step, because a tile may be simultaneously matched in a column and row slice.
      </p>
      <p>
        The algorithmic complexity of this step is <b>O(N)</b> where <b>N</b> is the total number of tiles in the board. Each cell is visited twice, once for its column and once for its row, however <Link to="https://en.wikipedia.org/wiki/Big_O_notation">Big O notation</Link> ignores constants and reduces from <b>O(2N)</b> to <b>O(N)</b>.
      </p>
      <Figure src-light="/images/projects/match_three/matching_light.png"
              src-dark="/images/projects/match_three/matching_dark.png"
              alt="Illustrating a row or column containing values 'A A B B B A B B', highlighting a single match including indices 2, 3, and 4; the index range 2 (inclusive) through 5 (exclusive)." />
      <Details summary="Matching logic">
        <CodeMirror lang="gdscript"
                    caption="Matching logic"
                    content="
          var size: Vector2i;

          func collect_matches() -> MatchResult:
            var regions: Array;
            var types: PackedInt32Array;
            var maybe_add_result = func(pos: Vector2i, axis: int, count: int, value: int) -> void:
              if count < 3:
                return;
              var extent: Vector2i;
              extent[axis] = count;
              extent[axis ^ 1] = 1;
              regions.append(Rect2i(pos.x, pos.y, extent.x, extent.y));
              types.append(value);
            for major_axis in range(2):
              var minor_axis = major_axis ^ 1;
              for minor_offset in range(size[minor_axis]):
                var start_pos: Vector2i;
                var last_value: int = INVALIDATED_CELL;
                var count: int = 0;
                for major_offset in range(size[major_axis]):
                  var current_pos: Vector2i;
                  current_pos[major_axis] = major_offset;
                  current_pos[minor_axis] = minor_offset;
                  var current_index: int = map_to_index(current_pos);
                  var current_value: int = value_at(current_index);
                  if last_value == current_value:
                    count += 1;
                    continue;
                  maybe_add_result.call(start_pos, major_axis, count, last_value);
                  start_pos = current_pos;
                  last_value = current_value;
                  count = 1;
                maybe_add_result.call(start_pos, major_axis, count, last_value);
            return MatchResult.new(regions, types);
          " />
        </Details>
    </Section>

    <Section heading="Invalidation">
      <p>
        After all matches have been collected, the next step is to invalidate the matched tiles.
        This step makes it easier to handle tile falling and randomization behavior and helps avoid processing any tiles more than once in later steps.
      </p>
      <p>
        This demo uses a tile <Link to="https://en.wikipedia.org/wiki/Sentinel_value">sentinel value</Link>, <b>INVALIDATED_CELL</b>, to avoid allocating another array or bit fiddling to track the invalidation state.
      </p>
      <p>
        During invalidation two additional values are collected for each column.
        These will be discussed in further in later sections, for now just know the following details are collected during invalidation.
      </p>
      <ul>
        <li>What is the lowest row invalidated within the column? This is useful during falling.</li>
        <li>How many tiles were invalidated within the column? This is useful during randomization.</li>
      </ul>
      <Figure src-light="/images/projects/match_three/invalidation_light.png"
              src-dark="/images/projects/match_three/invalidation_dark.png"
              alt="Illustration of a board before (left) and after (right) invalidation." />
      <Details summary="Invalidation logic">
        <CodeMirror lang="gdscript"
                    caption="Invalidation logic"
                    content="
            var size: Vector2i;

            func invalidate_regions(matches: MatchResult) -> InvalidationResult:
              var column_count: PackedInt32Array;
              column_count.resize(size.x);
              column_count.fill(0);
              var column_lowest: PackedInt32Array;
              column_lowest.resize(size.x);
              column_lowest.fill(size.y);
              for region in matches.regions():
                for x in range(region.position.x, region.end.x):
                  column_lowest[x] = min(column_lowest[x], region.position.y);
                  var first_index: int = map_to_index(Vector2i(x, region.position.y));
                  for offset in range(region.size.y):
                    if has_value_at(first_index + offset):
                      set_value_at(first_index + offset, INVALIDATED_CELL);
                      column_count[x] += 1;
              return InvalidationResult.new(column_count, column_lowest);
          " />
      </Details>
      <p>
        A few alternatives to consider:
      </p>
      <ul>
        <li>Create an array of boolean tile invalidation values where indices are associated with corresponding board tiles, which could be written while collecting matches rather than as a discrete invalidation process.</li>
        <li>
          If space becomes an issue for larger boards, invalidations could be packed into an equivalent bit array, however this is significantly slower to access than a byte array due to the bitwise operations required to access individual bits.
          <Details summary="Bit Indexing">
            <CodeMirror lang="gdscript"
                        caption="Bit Indexing"
                        content="
              # Returns a single bit from `chunk` at the least significant bit `index`.
              func bit_get(chunk: int, index: int) -> bool:
                return chunk & (1 << index);

              # Returns `chunk` with the bit at the least significant bit `index`
              # set to 1.
              func bit_set(chunk: int, index: int) -> int:
                return chunk | (1 << index);

              # Returns `chunk` with the bit at the least significant bit `index`
              # set to 0.
              func bit_clear(chunk: int, index: int) -> int:
                return chunk & ~(1 << index);

              # Returns `chunk` with the bit at the least significant bit `index`
              # toggled to its current opposite value.
              func bit_toggle(chunk: int, index: int) -> int:
                return chunk ^ (1 << index);
            " />
          </Details>
        </li>
        <li>
          If space is still an issue and the tile value has at least one unused bit, then the invalidation state could be encoded into its value, however this will also incur a similar cost to access either the invalidation state or value due to bitwise masking.
          <Details summary="Encoded Value">
            <CodeMirror lang="gdscript"
                        caption="Encoded Value"
                        content="
              # Note: GDScript (v4.4.1) `int` is a signed 64 bit value but
              # throws an error when defining negative hexadecimal constants,
              # such as (0x8000000000000000) == (-9223372036854775808).
              # ERROR: (4) Cannot represent 0x8000000000000000 as a 64-bit signed
              # integer, since the value is too large.
              #
              # This could also be handled with (x < 0) to check invalidation and
              # (-x) to toggle invalidation, but using bitwise operators avoids
              # adding additional branch statements when checking invalidation
              # (at least in C/C++ this is true).
              const INVALIDATION_BIT: int = -9223372036854775808;
              const VALUE_MASK: int = ~INVALIDATION_BIT;

              # Returns the invalidation portion of `input`.
              func get_invalidation(input: int) -> bool:
                return input & INVALIDATION_BIT;

              # Returns `input` with the invalidation bit toggled.
              func toggle_invalidation(input: int) -> int:
                return input ^ INVALIDATION_BIT;

              # Returns the value portion of `input`, clearing the invalidation bit.
              func get_value(input: int) -> int:
                return input & VALUE_MASK;

              # Returns `new_value` with the same invalidation state as `input`.
              func set_value(input: int, new_value: int) -> int:
                return (input & INVALIDATION_BIT) | get_value(new_value);
            " />
          </Details>
        </li>
      </ul>
    </Section>

    <Section heading="Falling">
      <p>
        Once invalidations are complete, falling can be applied to each column individually.
        This process iterates a column from bottom to top, swapping invalidated tiles with any populated tiles above them while preserving the relative ordering of populated tiles.
      </p>
      <p>
        During the invalidation step the lowest invalidated row was captured.
        This value yields two very important details for falling logic:
      </p>
      <ul>
        <li>Since columns are contiguous and processed independently, columns without invalidations can easily be skipped as the default lowest invalidated row is mapped to the column end iterator.</li>
        <li>Indicates how many tiles in a row are below invalidation and may be ignored, since only invalidated tiles and those above need to be updated during the falling step.</li>
      </ul>
      <Figure src-light="/images/projects/match_three/falling_light.png"
              src-dark="/images/projects/match_three/falling_dark.png"
              alt="Illustration of a board before (left) and after (right) falling is applied, lowering populated and raising invalidated tiles within each column." />
      <Details summary="Falling logic">
        <CodeMirror lang="gdscript"
                    caption="Falling logic"
                    content="
            var size: Vector2i;

            func apply_falling(invalidation_result: InvalidationResult) -> void:
              for x in range(size.x):
                var end_index: int = map_to_index(Vector2i(x, size.y));
                var write_index: int = end_index - (size.y - invalidation_result.first_invalidated_row(x));
                var read_index: int = write_index + 1;
                while read_index < end_index:
                  if has_value_at(read_index):
                    swap_at(read_index, write_index);
                    while write_index < end_index and has_value_at(write_index):
                      write_index += 1;
                    read_index = max(read_index, write_index);
                  read_index += 1;
          " />
        </Details>
    </Section>

    <Section heading="Randomization">
      <p>
        For randomizing the grid I drew inspiration from <Link to="https://en.wikipedia.org/wiki/Model_synthesis">wave function collapse (a.k.a. model synthesis)</Link> algorithms which apply constraints on invalidated tiles during generation to describe which subset of values are valid.
        This allows randomization to guarantee that among all the newly randomized tiles there will be no matches.
        However, there may be matches among the newly randomized tiles and existing tiles, to allow longer combos.
      </p>
      <p>
        Adding these constraints improves the initial board setup time and helps balance the game.
      </p>
      <Figure src-light="/images/projects/match_three/randomization_light.png"
              src-dark="/images/projects/match_three/randomization_dark.png"
              alt="Illustration of a board before (left) and after (right) randomization is applied, repopulating any invalidated tiles." />
      <Details summary="PossibleValues">
        <CodeMirror lang="gdscript"
                    caption="PossibleValues"
                    content="
        # Helper class containing a subset of possible values and
        # adjacency list of PossibleValues connected by which tile
        # value needs to be added or removed to create the adjacency.
        extends RefCounted
        class_name PossibleValues;

        var _values: PackedInt32Array;
        var _adjacencies: Dictionary;

        func _init(values: PackedInt32Array) -> void:
          _values = values;

        func pick_random() -> int:
          return _values[randi_range(0, _values.size() - 1)];

        func erase(value: int) -> void:
          var index:int = _values.find(value);
          if index == -1:
            return;
          _values.remove_at(index);

        func without(value: int) -> PossibleValues:
          var value_index: int = _values.find(value);
          if value_index == -1:
            return self;
          var cached_adjacency: PossibleValues = _adjacencies.get(value);
          if not cached_adjacency:
            var reduced_set: Array = _values.duplicate();
            reduced_set.remove_at(value_index);
            cached_adjacency = PossibleValues.new(reduced_set);
            _adjacencies.set(value, cached_adjacency);
          return cached_adjacency;
        " />
      </Details>
      <Details summary="Randomization logic">
        <CodeMirror lang="gdscript"
                    caption="Randomization logic"
                    content="
          extends RefCounted
          class_name WaveFunctionCollapse;

          var _unconstrained_set: PossibleValues;

          func _init(types: PackedInt32Array) -> void:
            _unconstrained_set = PossibleValues.new(types);

          func _add_constraint(constraints: Dictionary, index: int, without_value: int) -> void:
            var cached: PossibleValues = constraints.get(index, _unconstrained_set);
            constraints.set(index, cached.without(without_value));

          func _propagate(grid: GemGrid, constraints: Dictionary, index: int, pos: Vector2i) -> void:
            # Because this WFC implementation only populates in-order as opposed to
            # processing in an arbitrary order such as the order of most-constrained,
            # only two adjacency values are read. Values are always collapsed in the
            # order (+y) wrapping (+x), so positive offsets are always uninitialized and
            # negative offsets are always collapsed.
            #
            # This avoids a lot of unnecessary complexity that would be needed to resolve
            # collapsing arbitrarily.
            var new_value = grid.value_at(index);
            for axis in range(2):
              if pos[axis] <= 0 or pos[axis] >= grid.size[axis] - 1:
                continue;
              var offset: Vector2i;
              offset[axis] = 1;
              var before_position: int = grid.map_to_index(pos - offset);
              var after_position: int = grid.map_to_index(pos + offset);
              if grid.has_value_at(after_position) or new_value != grid.value_at(before_position):
                continue;
              _add_constraint(constraints, after_position, new_value);

          func _collapse(grid: GemGrid, constraints: Dictionary, index: int, pos: Vector2i) -> void:
            var values: PossibleValues = constraints.get(index, _unconstrained_set);
            if values != _unconstrained_set:
              constraints.erase(index);
            # Ignore any cells that have been populated, intentionally skipping the
            # propagation step. This allows the algorithm to re-generate arbitrary
            # invalidation regions guaranteeing both behaviors:
            # 1) There are no matches between invalidated gems being populated.
            # 2) There may be matches along the outer perimeter of the invalidated gems.
            if grid.has_value_at(index):
              return;
            grid.set_value_at(index, values.pick_random());
            _propagate(grid, constraints, index, pos);

          func populate(grid: GemGrid) -> void:
            var constraints: Dictionary;
            for x in range(grid.size.x):
              for y in range(grid.size.y):
                var point: Vector2i = Vector2i(x, y);
                _collapse(grid, constraints, grid.map_to_index(point), point);
        " />
      </Details>
    </Section>

    <Section heading="Animation">
      <p>
        All animations were created with GDScript <Link to="https://docs.godotengine.org/en/stable/classes/class_tween.html">Tween</Link> objects.
      </p>
      <p>
        To make synchronizing animation phases, audio, and data processing easier tweens are created and added to a processing queue in the <b>stopped</b> state.
        Tweens run by default, stopping them allows for deferring execution.
      </p>
      <Details summary="Falling animation">
        <CodeMirror lang="gdscript"
                    caption="Falling animation"
                    content="
          signal sequence_complete();
          var _grid: GemGrid;
          var _pending_tweens: Array;

          func play_falling(invalidation_result: InvalidationResult) -> void:
            var tween: Tween = create_tween().set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN_OUT).set_parallel();
            tween.stop();
            pending_tweens.push_back(tween);
            for x in range(_grid.size.x):
              var first_row: int = invalidation_result.first_invalidated_row(x);
              var first_index: int = _grid.map_to_index(Vector2i(x, first_row));
              for offset in range(_grid.size.y - first_row):
                var node: Node3D = _grid.node_at(first_index + offset);
                var current_position: Vector2i = _grid.local_to_map(node.position);
                var distance: int = current_position.y - (first_row + offset);
                tween.tween_property(node, &quot;position&quot;, _grid.map_to_local(Vector2i(x, first_row + offset)), _duration_for_distance[distance]);
            await sequence_complete;
        " />
      </Details>
    </Section>

    <Section heading="Background Blur Shader">
      <p>
        When pressing one of the "?" buttons to learn more about a game mode, a modal dialog is opened which blurs the background behind it on supported platforms.
      </p>
      <p>
        This effect is implemented with <Link to="https://docs.godotengine.org/en/stable/tutorials/shaders/screen-reading_shaders.html">screen reading shaders</Link> with the shader hint <b>hint_screen_texture</b>.
        The <b>lod</b> parameter of <Link to="https://www.khronos.org/opengles/sdk/docs/manglsl/docbook4/xhtml/textureLod.xml">textureLod</Link> affects the intensity of the blur effect.
      </p>
      <p>
        Unfortunately, at the time of writing this combination may not work properly in mobile browsers.
      </p>
      <Figure src="/images/projects/match_three/blur_example.png"
              alt="Example of the blur shader applied behind a modal dialog." />
      <Details summary="Blur Shader">
        <CodeMirror lang="gdscript"
                    caption="Blur Shader"
                    content="
          shader_type canvas_item;

          uniform sampler2D SCREEN_TEXTURE : hint_screen_texture, repeat_disable, filter_linear_mipmap_anisotropic;
          uniform float lod: hint_range(0.0, 5.0) = 3.0;

          void fragment() {
            COLOR = textureLod(SCREEN_TEXTURE, SCREEN_UV, lod);
          }
        " />
      </Details>
    </Section>

    <Section heading="Grid Background Shader">
      <p>
        The grid checkerboard background is applied with a spatial shader.
      </p>
      <p>
        In this scene each tile is 1x1 world unit and the shader assumes the grid is aligned to a world unit.
        Tile color is determined by whether its <Link to="https://en.wikipedia.org/wiki/Taxicab_geometry">Manhattan distance</Link> is odd or even.
      </p>
      <Figure src-light="/images/projects/match_three/manhattan_distance_light.png"
              src-dark="/images/projects/match_three/manhattan_distance_dark.png"
              alt="Composition of the reticle with two step functions." />

      <Player :ref="player.ref(DemoKey.CheckerBoard)"
              title="Checkerboard"
              date="2026/03/16"
              frame="/library/projects/shader_loader/shader_loader.html"
              :state="player_states[DemoKey.CheckerBoard]"
              @load="onShaderFrameLoaded(DemoKey.CheckerBoard)" />

      <PropertyEditor v-bind:rows="shader_editors[DemoKey.CheckerBoard].rows" v-model="shader_editors[DemoKey.CheckerBoard].models" v-on="shader_editors[DemoKey.CheckerBoard].onPropertyEmit" />

      <Details summary="Grid Shader">
        <TabList :entries="[['gdscript', 'GDScript'], ['glsl', 'GLSL']]" v-model:selected_tab="selected_checker_frag">
          <CodeMirror v-show="selected_checker_frag === 'gdscript'"
                      lang="gdscript"
                      caption="Grid Shader"
                      content="
            shader_type spatial;

            uniform vec4 checkered_a: source_color = vec4(vec3(0.2), 1);
            uniform vec4 checkered_b: source_color = vec4(vec3(0.3), 1);

            void fragment() {
              vec3 world_pos = (INV_VIEW_MATRIX * vec4(VERTEX, 1.0)).xyz;
              vec2 grid_uv = abs(world_pos.xy);
              bool is_even = mod(floor(grid_uv.x) + floor(grid_uv.y), 2.0) == 0.0;
              ALBEDO = is_even ? checkered_a.rgb : checkered_b.rgb;
              ALPHA = 1;
            }
          " />
          <CodeMirror v-show="selected_checker_frag === 'glsl'"
                      lang="cpp"
                      caption="Grid Shader"
                      :content="checker_board_fragment_shader" />
        </TabList>
      </Details>
    </Section>

    <Section heading="Focus Reticle Shader">
      <p>
        A focus reticle is drawn by applying a shader to a simple quad geometry which is placed over the focused tile.
      </p>
      <Figure src-light="/images/projects/match_three/reticle_composition_light.png"
              src-dark="/images/projects/match_three/reticle_composition_dark.png"
              alt="Composition of the reticle with two step functions." />

      <Player :ref="player.ref(DemoKey.FocusReticle)"
              title="Focus Reticle"
              date="2026/03/16"
              frame="/library/projects/shader_loader/shader_loader.html"
              :state="player_states[DemoKey.FocusReticle]"
              @load="onShaderFrameLoaded(DemoKey.FocusReticle)" />

      <PropertyEditor v-bind:rows="shader_editors[DemoKey.FocusReticle].rows" v-model="shader_editors[DemoKey.FocusReticle].models" v-on="shader_editors[DemoKey.FocusReticle].onPropertyEmit" />

      <Details summary="Reticle Shader">
        <TabList :entries="[['gdscript', 'GDScript'], ['glsl', 'GLSL']]" v-model:selected_tab="selected_reticle_frag">
          <CodeMirror v-show="selected_reticle_frag === 'gdscript'"
                      lang="gdscript"
                      caption="Reticle Shader"
                      content="
            shader_type spatial;

            uniform float stroke_width: hint_range(0.0, 0.5) = 0.075;
            uniform float gap: hint_range(0.0, 1.0) = 0.5;
            uniform vec4 color: source_color = vec4(1.0);

            void fragment() {
              vec2 extent = abs(UV - vec2(0.5));
              float min_extent = min(extent.x, extent.y);
              float max_extent = max(extent.x, extent.y);
              ALBEDO = color.rgb;
              // First step cuts out the middle square,
              // second step cuts gaps around each axis
              ALPHA = min(step(0.5 - stroke_width, max_extent), step(gap * 0.5, min_extent));
            }
          " />
          <CodeMirror v-show="selected_reticle_frag === 'glsl'"
                      lang="cpp"
                      caption="Reticle Shader"
                      :content="focus_reticle_fragment_shader" />
        </TabList>
      </Details>
    </Section>

    <Section heading="Particle Effects">
      <p>
        Score particles are spawned at the center of each match with a <Link to="https://docs.godotengine.org/en/stable/classes/class_packedscene.html">PackedScene</Link> and destroy themselves by calling Node <Link to="https://docs.godotengine.org/en/stable/classes/class_node.html#class-node-method-queue-free">queue_free</Link> once their animation is complete.
      </p>
      <p>
        This demo doesn't differentiate between tile type, match score, or combo size when spawning particle effects.
        Those details could be provided to the particle to change its font color and other styles, or to include additional effects or animations.
      </p>
      <Figure :src="score_particles_gif"
              alt="Score particles animation for a combo, the matches produce (+4) and (+12) points respectively." />
      <Details summary="Score particle">
        <CodeMirror lang="gdscript"
                    caption="Score particle"
                    content="
          extends Node3D
          class_name ScoreParticle;

          const TTL: float = 1.25;

          var _score: int;
          var _combo: int;
          var _type: int;
          var _tween: Tween;

          func _ready() -> void:
            $Label3D.text = &quot;+%d&quot; % _score;
            _tween = create_tween().set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT).set_parallel();
            _tween.tween_property(self, &quot;scale&quot;, Vector3.ONE * 2.0, TTL);
            _tween.tween_property(self, &quot;position&quot;, Vector3.UP * 0.25, TTL).as_relative();
            _tween.chain().tween_callback(queue_free);

          func set_score(score: int) -> ScoreParticle:
            _score = score;
            return self;

          func set_combo(combo: int) -> ScoreParticle:
            _combo = combo;
            return self;

          func set_type(type: int) -> ScoreParticle:
            _type = type;
            return self;
        " />
      </Details>
      <Details summary="Spawn Particle">
        <CodeMirror lang="gdscript"
                    caption="Spawn Particle"
                    content="
          const score_particle_template: PackedScene = preload(&quot;res://scenes/score_particle/score_particle.tscn&quot;);

          func _on_matched(matches: MatchResult) -> void:
            AudioManager.on_match(matches.starting_combo() + matches.size());
            for region_index in range(matches.size()):
              var particle: ScoreParticle = score_particle_template.instantiate();
              particle.set_score(matches.score_at(region_index));
              particle.set_combo(matches.size());
              particle.set_type(matches.type_at(region_index));
              particle.position = _grid.map_to_local(matches.region_at(region_index).get_center());
              $Overlay.add_child(particle);
        " />
      </Details>
    </Section>
  </article>
</template>
