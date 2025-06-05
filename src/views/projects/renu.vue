<script setup>
import Player from '../../components/player.vue'
import ProjectLabel from '../../components/project_label.vue'
import Box from '../../components/box.vue'
import TextDivider from '../../components/text_divider.vue'
const props = defineProps({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  lastmod: { type: Date },
  frame: { type: String, required: true },
})
</script>

<template>
  <Player :title="title"
          :date="date"
          :lastmod="lastmod"
          :frame="frame" />
  <ProjectLabel :title="title"
                :date="date"
                :lastmod="lastmod" />

  <Box class="content">
    <TextDivider>What's Imagine Cup?</TextDivider>
    <p>
      <a href="https://imaginecup.microsoft.com/">Imagine Cup</a> is an annual competition run by Microsoft. This year, "Imagine Cup 2013 @ RIT" ran from November 30th from 7:00PM - December 1st 6:00PM EST, a mere 23 hours. Microsoft visited the Rochester Institute of Technology to talk about Windows 8 and sponsored a small Imagine Cup for Interactive Games and Media at RIT. I had participated in a group of four, and we built a platforming game with 5 levels and a boss battle using CreateJS, PreloadJS, and SoundJS in Visual Studios 2012 targeting Windows 8. Our game RENU won second place and everyone who played seemed to really enjoy it.
    </p>

    <TextDivider>Competition Theme</TextDivider>
    <p>
      The theme of the competition, which I believe has been consistent throughout all competitions, was to design and implement a game or app around the idea of "make a difference in the world through the power of technology". Our team designed our game around the theme of cleaning the environment to make the world a more enjoyable place.
      <img src="/library/projects/renu/images/gameplay.png" width="720" height="576" />
    </p>

    <TextDivider>Team</TextDivider>
    <p>
      Our team consisted of Amanda Rivet, Nate Lemoi, Le Josh Davis, and myself. Amanda created all of the art and animations for the game, Nate created all of the music and sound effects, and Josh mostly helped design the game mechanics and experience as well as some programming. As for myself, I did nearly all of the programming and I designed each of the levels.
    </p>
    <div class="team-grid">
      <img class="team_image" src="/library/projects/renu/images/team.jpg" width="640" height="160" />
      <h3 class="team-c1">Adam Ettenberger</h3>
      <h3 class="team-c2">Amanda Rivet</h3>
      <h3 class="team-c3">Nate Lemoi</h3>
      <h3 class="team-c4">Le Josh Davis</h3>
    </div>
    <TextDivider>Levels</TextDivider>
    <p>
      One feature I implemented was Bitmap levels. By this I mean, representing an entire level using certain colors to represent different tiles, enemies, and your spawn point. In the above example, Green is the spawn point, Red are enemies, and Black are impassable tiles. This allowed us to quickly create, modify, and transition between maps without having to write out each individual location or learning a new tool. We were able to create maps using MS-Paint. The above example is a blown up representation of the 32x24 tile map above.
      <img src="/library/projects/renu/images/levelSample.png" width="320" height="240" />
    </p>
    <TextDivider>Animations</TextDivider>
    <p>
      One design decision we made was rather than making an additional animation for death, we would instead reuse the particles and make is appear as if the player had exploded when in contact with an enemy unit. Additionally, we decided that instead of having health or lives, we would allow the player to continue from the beginning of the level as many times as they would like. This not only reduced some development time, but also in my opinion made the game less frustrating if you ended up dying a lot on a certain level.
      <img src="/library/projects/renu/images/death.png" width="640" height="121" />
      <img src="/library/projects/renu/images/death_animation.gif" width="640" height="480" />
    </p>
    <TextDivider>Physics</TextDivider>
    <p>
      One detail you may have noticed thought these screenshots is that some of the tiles don't seem to fit the rest of the map. This is a feature we added about an hour before the Imagine Cup was over. The dark, gross mossy looking tiles are very common in the world, representing grime and sludge on the ground, while the grassy patches are a result of your cleansing squirt gun. One thing the player will notice immediately about walking on the cleaned patches versus the grimy patches is that friction is much higher on the clean paths. This causes the player to slow down much faster when they are not trying to move in any direction, which in turn makes some jumps easier to make.
      <img src="/library/projects/renu/images/tiles.png" width="272" height="209" />
      <img src="/library/projects/renu/images/variable_friction.gif" width="640" height="480" />

    </p>
    <TextDivider>Boss Fight</TextDivider>
    <p>
      The boss level was designed as an empty map with only you and a behemoth slime that bounced across the map. This was not only a fun challenge, but was easily the most difficult part of the game. As I mentioned before, when your squirt gun pellets hit a tile, it cleans it as well as increases friction for that tile. This produced an interesting challenge where you needed to dodge this giant bouncing slime, as well as make sure you don't miss because it would reduce your ability to dodging.
      <img src="/library/projects/renu/images/boss.png" width="495" height="387" />

    </p>
  </Box>
</template>

<style scoped>
.content {
  margin-top: 0.5lh;
}

img,
svg {
  display: block;
  justify-self: center;
  align-self: center;
  border: 6px solid var(--color-divider);
  margin: var(--size-padding-round) 0;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto min-content;
  justify-items: center;
  justify-self: center;
  text-align: center;
  border: 6px solid var(--color-divider);
  margin: var(--size-padding-round) 0;

  & > .team_image {
    grid-column: 1 / 5;
    grid-row: 1 / 2;
    margin: 0;
    padding: 0;
    border: 0;
  }
  & > .team-c1,
  & > .team-c2,
  & > .team-c3,
  & > .team-c4 {
    grid-row: 2 / 3;
  }
  & > .team-c1 { grid-column: 1 / 2; }
  & > .team-c2 { grid-column: 2 / 3; }
  & > .team-c3 { grid-column: 3 / 4; }
  & > .team-c4 { grid-column: 4 / 5; }
}
</style>
