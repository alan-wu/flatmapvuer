<template>
  <div class="legends-container">
    <svg version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 500 500" style="enable-background:new 0 0 500 500;" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com">
      <defs>
        <bx:grid height="30.447" width="32.516" x="0" y="0"/>
      </defs>
      <path class="st0 st0-translate" d="M61.3,103.8c-15.9,0-28.8-12.3-28.8-27.3c0-15,13-27.3,28.8-27.3s28.8,12.3,28.8,27.3 C90.1,91.5,77.2,103.8,61.3,103.8z"/>
      <path class="st1" d="M40.3,356.1C29.5,345,29.8,328,41.5,317.5c11.7-10.5,29.6-9.9,40.7,1.1c11.1,11,10.5,28.1-1.2,38.5 C69.3,367.4,51.1,366.9,40.3,356.1z"/>
      <path class="st2" d="M61.2,396.9c-5.3,9.3-15.3,15.1-26.1,15.1l-0.4,0.6c5.1,9,5.1,20,0,29l0.4,0.6c10.7,0,20.8,5.8,26.1,15.1 c5.3-9.3,15.3-15.1,26.1-15.1c-5.3-9.3-5.3-20.9,0-30.4C76.6,412.1,66.7,406.3,61.2,396.9z"/>
      <path class="featureStar" d="M11.0748 3.25583C11.4141 2.42845 12.5859 2.42845 12.9252 3.25583L14.6493 7.45955C14.793 7.80979 15.1221 8.04889 15.4995 8.07727L20.0303 8.41798C20.922 8.48504 21.2841 9.59942 20.6021 10.1778L17.1369 13.1166C16.8482 13.3614 16.7225 13.7483 16.8122 14.1161L17.8882 18.5304C18.1 19.3992 17.152 20.0879 16.3912 19.618L12.5255 17.2305C12.2034 17.0316 11.7966 17.0316 11.4745 17.2305L7.60881 19.618C6.84796 20.0879 5.90001 19.3992 6.1118 18.5304L7.18785 14.1161C7.2775 13.7483 7.1518 13.3614 6.86309 13.1166L3.3979 10.1778C2.71588 9.59942 3.07796 8.48504 3.96971 8.41798L8.50046 8.07727C8.87794 8.04889 9.20704 7.80979 9.35068 7.45955L11.0748 3.25583Z" />
      <text transform="matrix(0.9908 0 0 1 118.0161 171.7975)" class="st3 st4 st5" style="white-space: pre;">Tissue region</text>
      <path class="st6" d="M40.9,231.1c11.3-10.6,29.5-10.6,40.8,0c11.3,10.6,11.3,27.9,0,38.5c-11.3,10.6-29.5,10.6-40.8,0 C29.7,259,29.7,241.7,40.9,231.1z"/>
      <text transform="matrix(0.9908 0 0 1 118.0161 257.675)" class="st3 st4 st5" style="white-space: pre;">Brain nuclei</text>
      <!-- Hide this unti we can clarify the label
      <path class="st7" d="M34.3,174c-6.2-13.9,0.6-29.9,15.3-35.7c14.7-5.9,31.6,0.6,37.8,14.4c1.5,3.5,2.3,7,2.3,10.6 c0,10.6-6.6,20.8-17.6,25.2C57.5,194.3,40.5,187.9,34.3,174z"/>
      <text transform="matrix(0.9908 0 0 1 117.5474 171.7975)" class="st3 st4 st5" style="white-space: pre;">Specific anatomical structure</text>
      -->
      <text transform="matrix(0.9908 0 0 1 118.0903 345.5266)" class="st3 st4 st5" style="white-space: pre;">Ganglia</text>
      <text transform="matrix(0.9908 0 0 1 118.0903 433.1613)" class="st3 st4 st5" style="white-space: pre;">Ganglionated nerve plexus</text>
    </svg>
    <svg width="72px" height="72px" viewBox="0 0 24 24" fill="yellow"></svg>
  </div>
</template>

<script>
export default {
   name: 'SvgLegends',
}
</script>

<style scoped lang="scss">
.legends-container {
  pointer-events: none;
  transform: translate(0px, -35px);
}

.st0-translate {
  transform: translate(0px, 88px);
}
.st0 {
  fill:#FF33CC;
}
.st1 {
  fill:#B2F074;
}
.st2 {
  opacity:0.64;
  fill:#E4E417;
  enable-background:new;
}
.st3 {
  fill:#333333;
}
.st4 {
  font-family:Asap, sans-serif;
}
.st5 {
  font-size:32px;
}
.st6 {
  fill:#F15A24;
}
.st7 {
  fill:#66FFFF;
  stroke:#000000;
  stroke-width:3;
}

.featureStar {
  fill: #FFD700;
  stroke: #000000;
  stroke-width: 1;
}
</style>
