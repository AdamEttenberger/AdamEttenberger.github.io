<script setup lang="ts">
import Link from '@/components/link.vue'
import Figure from '@/components/figure.vue'
import Player from '@/components/player.vue'
import Section from '@/components/section.vue'
import { type IProjectInfo } from '@/types/project_types'
defineProps<IProjectInfo>();
</script>

<template>
  <article>
    <Player :title="title"
            :date="date"
            :lastmod="lastmod"
            frame="/library/projects/renu/main.html" />

    <Section heading="What's Imagine Cup?">
      <p>
        <Link to="https://imaginecup.microsoft.com/">Imagine Cup</Link> is an annual competition run by Microsoft.
        This year, "Imagine Cup 2013 @ RIT" ran from November 30th from 7:00PM - December 1st 6:00PM EST, a mere 23 hours.
        Microsoft visited the Rochester Institute of Technology to talk about Windows 8 and sponsored a small Imagine Cup for Interactive Games and Media at RIT.
        I had participated in a group of four, and we built a platforming game with 5 levels and a boss battle using CreateJS, PreloadJS, and SoundJS in Visual Studios 2012 targeting Windows 8.
        Our game RENU won second place and everyone who played seemed to really enjoy it.
      </p>
    </Section>

    <Section heading="Competition Theme">
      <p>
        The theme of the competition, which I believe has been consistent throughout all competitions, was to design and implement a game or app around the idea of "make a difference in the world through the power of technology".
        Our team designed our game around the theme of cleaning the environment to make the world a more enjoyable place.
      </p>
    </Section>


    <Section heading="Team">
      <p>
        Our team consisted of Amanda Rivet, Nate Lemoi, Le Josh Davis, and myself.
        Amanda created all of the art and animations for the game, Nate created all of the music and sound effects, and Josh mostly helped design the game mechanics and experience as well as some programming.
        As for myself, I did nearly all of the programming and I designed each of the levels.
      </p>
      <Figure class="team"
              src="/images/projects/renu/team.jpg"
              alt="Profile pictures of the team members.">
        <template v-slot:caption>
          <ol class="columns authors list-none" aria-label="team members">
            <li>Adam Ettenberger</li>
            <li>Amanda Rivet</li>
            <li>Nate Lemoi</li>
            <li>Le Josh Davis</li>
          </ol>
        </template>
      </Figure>
    </Section>

    <Section heading="Levels">
      <p>
        One feature I implemented was Bitmap levels.
        By this I mean, representing an entire level using certain colors to represent different tiles, enemies, and your spawn point.
        In the below example, Green is the spawn point, Red are enemies, and Black are impassable tiles.
        This allowed us to quickly create, modify, and transition between maps without having to write out each individual location or learning a new tool.
        We were able to create maps using MS-Paint.
      </p>
      <Figure src="/images/projects/renu/levelSample.png"
              alt="Example of the bitmap level file used in the previous game screen image." />
      <Figure src="/images/projects/renu/gameplay.png"
              alt="Player shooting at an enemy, showing the full game screen." />
    </Section>

    <Section heading="Animations">
      <p>
        One design decision we made was rather than making an additional animation for death, we would instead reuse the particles and make is appear as if the player had exploded when in contact with an enemy unit.
        Additionally, we decided that instead of having health or lives, we would allow the player to continue from the beginning of the level as many times as they would like.
        This not only reduced some development time, but also in my opinion made the game less frustrating if you ended up dying a lot on a certain level.
      </p>
      <Figure src="/images/projects/renu/death_animation.gif"
              alt="Animation illustrating the physics-based player death animation." />
    </Section>

    <Section heading="Physics">
      <p>
        One detail you may have noticed thought these screenshots is that some of the tiles don't seem to fit the rest of the map.
        This is a feature we added about an hour before the Imagine Cup was over.
        The dark, gross mossy looking tiles are very common in the world, representing grime and sludge on the ground, while the grassy patches are a result of your cleansing squirt gun.
        One thing the player will notice immediately about walking on the cleaned patches versus the grimy patches is that friction is much higher on the clean paths.
        This causes the player to slow down much faster when they are not trying to move in any direction, which in turn makes some jumps easier to make.
      </p>
      <Figure src="/images/projects/renu/slippery_tiles.gif"
              alt="Animation demonstrating how one tile type has lass friction, slippery movement." />
      <Figure src="/images/projects/renu/sticky_tiles.gif"
              alt="Animation demonstrating how one tile type has more friction, sticky movement." />
      <Figure src="/images/projects/renu/tile_difference.gif"
              alt="Animation demonstrating the difference in friction between the two terrain tile types." />
      <p>
        Another subtle feature is the floaty-jump, which makes the slippery platforming more forgiving.
        Players are allowed 1 jump action which resets after the touching the ground.
      </p>
      <Figure src="/images/projects/renu/floaty_jump.gif"
              alt="Animation demonstrating a player jumping in mid-air after walking off a platform." />
    </Section>

    <Section heading="Boss Fight">
      <p>
        The boss level was designed as an empty map with only you and a behemoth slime that bounced across the map.
        This was not only a fun challenge, but was easily the most difficult part of the game.
        As I mentioned before, when your squirt gun pellets hit a tile, it cleans it as well as increases friction for that tile.
        This produced an interesting challenge where you needed to dodge this giant bouncing slime, as well as make sure you don't miss because that reduces your ability to dodge the boss.
      </p>
      <Figure src="/images/projects/renu/boss.png"
              alt="Player (on the left) standing next to the enemy boss (on the right)." />
    </Section>
  </article>
</template>

<style scoped>
.team {
  display: flex;
  flex-direction: column;
  & > img {
    width: 100%;
  }
}

ol.authors {
  padding: 0;

  & > * {
    flex: 1;
    font-size: large;
    text-align: center;
    min-width: 25%;
  }
}
</style>
