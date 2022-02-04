import faunadb from 'faunadb';

const faunadbClient = new faunadb.Client({
    secret: 'fnAEZdV4I8AARa49Wpu_8Jmy5endniTFdYT7yBoF',
    domain: 'db.us.fauna.com',
    port: 443,
    scheme: 'https'
})
const q = faunadb.query;

const fetchUpdates = async () => {
    let currVer = chrome.runtime.getManifest().version;
    try {
        const res = await faunadbClient.query( 
            q.Map(
              q.Paginate(
                q.Filter(q.Documents(q.Collection('updates')), q.Lambda('update', q.LTE(q.Select(['data', 'version'], q.Get(q.Var('update'))), currVer))),
                {size: 10}
              ), 
              q.Lambda(ref => q.Let({
                originDoc: q.Get(ref)
              },
              q.Merge(q.Select('data', q.Var('originDoc')),{
                date_added: q.ToMillis(q.Select(['data','date_added'], q.Var('originDoc'))),
                id: q.Select('ts', q.Var('originDoc'))
              })
              ))
            )
          )
        const updates = [];

        if (res && res.data) {
            chrome.storage.local.get("events", function(r){
              let old = r.events || [];
              res.data.forEach(x => {
                let index = old.findIndex(oldEvent => oldEvent.id === x.id);
                if (index !== -1) {
                  x.viewed = old[index].viewed
                } 
                updates.push(x)
              });
              chrome.storage.local.set({"events": updates});
            });
            console.log("Fetch updates success!");
        }
    } catch(e) {
        console.error(e);
    }
}

export default {
  fetchUpdates
}