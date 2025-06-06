<script setup>
import Player from '../../components/player.vue'
import ProjectLabel from '../../components/project_label.vue'
import Column from '../../components/column.vue'
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

  <Column class="content">
    <TextDivider>What's Imagine Cup?</TextDivider>
    <p>
      <a href="https://imaginecup.microsoft.com/">Imagine Cup</a> is an annual competition run by Microsoft. This year, "Imagine Cup 2013 @ RIT" ran from November 30th from 7:00PM - December 1st 6:00PM EST, a mere 23 hours. Microsoft visited the Rochester Institute of Technology to talk about Windows 8 and sponsored a small Imagine Cup for Interactive Games and Media at RIT. I had participated in a group of four, and we built a platforming game with 5 levels and a boss battle using CreateJS, PreloadJS, and SoundJS in Visual Studios 2012 targeting Windows 8. Our game RENU won second place and everyone who played seemed to really enjoy it.
    </p>

    <TextDivider>Competition Theme</TextDivider>
    <p>
      The theme of the competition, which I believe has been consistent throughout all competitions, was to design and implement a game or app around the idea of "make a difference in the world through the power of technology". Our team designed our game around the theme of cleaning the environment to make the world a more enjoyable place.
    </p>

    <TextDivider>Team</TextDivider>
    <p>
      Our team consisted of Amanda Rivet, Nate Lemoi, Le Josh Davis, and myself. Amanda created all of the art and animations for the game, Nate created all of the music and sound effects, and Josh mostly helped design the game mechanics and experience as well as some programming. As for myself, I did nearly all of the programming and I designed each of the levels.
    </p>
    <div class="team-grid">
      <img class="team_image" src="/library/projects/renu/images/team.jpg"
           alt="profile pictures of the team members" />
      <h3 class="team-c1">Adam Ettenberger</h3>
      <h3 class="team-c2">Amanda Rivet</h3>
      <h3 class="team-c3">Nate Lemoi</h3>
      <h3 class="team-c4">Le Josh Davis</h3>
    </div>
    <TextDivider>Levels</TextDivider>
    <p>
      One feature I implemented was Bitmap levels. By this I mean, representing an entire level using certain colors to represent different tiles, enemies, and your spawn point. In the below example, Green is the spawn point, Red are enemies, and Black are impassable tiles. This allowed us to quickly create, modify, and transition between maps without having to write out each individual location or learning a new tool. We were able to create maps using MS-Paint.
    </p>
    <img src="/library/projects/renu/images/levelSample.png"
        alt="Example of the bitmap level file used in the previous game screen image" />
    <img src="/library/projects/renu/images/gameplay.png"
        alt="image of a player shooting at an enemy, showing the full game screen" />
    <TextDivider>Animations</TextDivider>
    <p>
      One design decision we made was rather than making an additional animation for death, we would instead reuse the particles and make is appear as if the player had exploded when in contact with an enemy unit. Additionally, we decided that instead of having health or lives, we would allow the player to continue from the beginning of the level as many times as they would like. This not only reduced some development time, but also in my opinion made the game less frustrating if you ended up dying a lot on a certain level.
      <img src="/library/projects/renu/images/death_animation.gif"
           alt="animation illustrating the physics-based player death animation" />
    </p>
    <TextDivider>Physics</TextDivider>
    <p>
      One detail you may have noticed thought these screenshots is that some of the tiles don't seem to fit the rest of the map. This is a feature we added about an hour before the Imagine Cup was over. The dark, gross mossy looking tiles are very common in the world, representing grime and sludge on the ground, while the grassy patches are a result of your cleansing squirt gun. One thing the player will notice immediately about walking on the cleaned patches versus the grimy patches is that friction is much higher on the clean paths. This causes the player to slow down much faster when they are not trying to move in any direction, which in turn makes some jumps easier to make.
      <img src="/library/projects/renu/images/slippery_tiles.gif"
           alt="animation demonstrating how one tile type is slippery" />
      <img src="/library/projects/renu/images/sticky_tiles.gif"
           alt="animation demonstrating how one tile type is sticky" />
      <img src="/library/projects/renu/images/tile_difference.gif"
           alt="animation demonstrating the difference in friction between the two terrain tile types" />
    </p>
    <TextDivider>Boss Fight</TextDivider>
    <p>
      The boss level was designed as an empty map with only you and a behemoth slime that bounced across the map. This was not only a fun challenge, but was easily the most difficult part of the game. As I mentioned before, when your squirt gun pellets hit a tile, it cleans it as well as increases friction for that tile. This produced an interesting challenge where you needed to dodge this giant bouncing slime, as well as make sure you don't miss because that reduces your ability to dodge the boss.
      <img src="/library/projects/renu/images/boss.png"
           alt="image of the player (on the left) standing next to the boss (on the right)" />

    </p>
  </Column>
</template>

<style scoped>
.content {
  & > img,
  & > svg,
  & > p > img,
  & > p > svg,
  & .team-grid {
    display: block;
    place-self: center;
    justify-self: center;
    align-self: center;
    border: 6px solid var(--color-divider);
    margin: var(--size-padding-round) 0;
    width: 90%;
  }

  & .team-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: auto min-content;
    place-self: center;
    text-align: center;
    justify-items: stretch;
    border: 6px solid var(--color-divider);
    margin: var(--size-padding-round) 0;
    width: 90%;

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
}

@media only screen and (max-width: 740px) {
  .column {
    & > img,
    & > svg,
    & > p > img,
    & > p > svg,
    & .team-grid {
      width: 100%;
    }
  }
}
</style>
