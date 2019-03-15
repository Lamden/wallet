<template>
  <el-container>
    <div class="block">
        <el-timeline>
            <el-timeline-item
            v-for="(activity, index) in formattedTransactions"
            placement="top"
            :key="index"
            :color="activity.color"
            :icon="activity.icon"
            :timestamp="activity.timestamp">
            {{activity.content}}
            </el-timeline-item>
    </el-timeline>
        </div>
  </el-container>
</template>

<script>
import lamdenLogo from './lamdenLogo';

export default {
  props: ['storage','lastView'],
  data() {
    return { 
        activities2: [{
          content: 'Custom icon',
          timestamp: '2018-04-12 20:46',
          size: 'large',
          type: 'primary',
          icon: 'el-icon-more'
        }, {
          content: 'Custom color',
          timestamp: '2018-04-03 20:46',
          color: '#0bbd87'
        }, {
          content: 'Custom size',
          timestamp: '2018-04-03 20:46',
          size: 'large'
        }, {
          content: 'Default node',
          timestamp: '2018-04-03 20:46'
        }],
        transactions: []
    };
  },
  created(){
      this.transactions = this.storage.getTransactions('DarkTauDTAU', '20da05fdba92449732b3871cc542a058075446fedb41430ee882e99f9091cc4d');
      console.log(this.transactions);
  },
  computed: {
      formattedTransactions: function formattedTransactions(){
          let trans = [];
          for (let transaction in this.transactions){
              console.log(transaction)
              let t = {}
            t.timestamp = this.transactions[transaction].date + ' ' + this.transactions[transaction].time ;
            t.content = this.transactions[transaction].txHash;
            t.color = 'orange';
            t.icon = 'el-icon-loading';
            if (this.transactions[transaction].status === 'SUCC'){
                 t.color = 'green'
                 t.icon = 'el-icon-check'
            }
            if (this.transactions[transaction].status === 'FAIL'){
                 t.color = 'red'
                 t.icon = 'el-icon-close'
            }
            trans.push(t);
          }
          console.log(trans);
          return trans;
      }
  },
  methods: {
  },
  components: {
  }
};
</script>

<style>

</style>
