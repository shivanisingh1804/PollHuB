
// app.js - Single-file React app using browser localStorage as a mock backend.
// Provides: Signup/Login, role-based views (User / Admin), Poll CRUD, vote once, closing time, static results chart.

const e = React.createElement;
const { useState, useEffect } = React;

const STORAGE_KEYS = {
  USERS: "pa_users",
  POLLS: "pa_polls",
  VOTES: "pa_votes",
  CURRENT: "pa_currentUser"
};

// UTIL helpers
function uid(prefix="id"){
  return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,7);
}
function load(key, fallback){ try{ const v = localStorage.getItem(key); return v? JSON.parse(v):fallback;}catch(e){return fallback;} }
function save(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

// Init with an admin account if no users exist
function ensureSeed(){
  const users = load(STORAGE_KEYS.USERS, []);
  if(users.length===0){
    users.push({ id: uid("user"), name: "admin", email: "admin@poll.app", password: "admin123", role: "admin" });
    users.push({ id: uid("user"), name: "alice", email: "alice@poll.app", password: "alice123", role: "user" });
    save(STORAGE_KEYS.USERS, users);
  }
  const polls = load(STORAGE_KEYS.POLLS, []);
  if(polls.length===0){
    save(STORAGE_KEYS.POLLS, polls);
  }
  const votes = load(STORAGE_KEYS.VOTES, []);
  save(STORAGE_KEYS.VOTES, votes);
}
ensureSeed();

// Auth Component
function Auth({ onAuth }){
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [err, setErr] = useState("");

  function handleSignup(eve){
    eve.preventDefault();
    if(!name.trim() || !email.trim() || !password.trim()){ setErr("All fields required"); return; }
    const users = load(STORAGE_KEYS.USERS, []);
    if(users.find(u=>u.email.toLowerCase()===email.toLowerCase())){ setErr("Email already registered"); return; }
    const user = { id: uid("user"), name, email, password, role };
    users.push(user);
    save(STORAGE_KEYS.USERS, users);
    setErr("");
    setName(""); setEmail(""); setPassword("");
    alert("Signup successful. Please login.");
    setMode("login");
  }
  function handleLogin(eve){
    eve.preventDefault();
    const users = load(STORAGE_KEYS.USERS, []);
    const found = users.find(u=>u.email.toLowerCase()===email.toLowerCase() && u.password===password);
    if(!found){ setErr("Invalid credentials"); return; }
    save(STORAGE_KEYS.CURRENT, found);
    onAuth(found);
  }

  return e("div", { className: "card" },
    e("div", { className: "header" },
      e("div", { className: "brand" }, mode==="login" ? "Login" : "Sign up"),
      e("div", null,
        e("button", { className: "btn ghost", onClick: ()=>setMode(mode==="login"?"signup":"login") }, mode==="login" ? "Switch to Signup" : "Switch to Login")
      )
    ),
    err && e("div", { className: "error" }, err),
    e("form", { onSubmit: mode==="login"?handleLogin:handleSignup },
      mode==="signup" && e("div", null,
        e("div", { className: "form-row" },
          e("input", { className: "input", placeholder: "Full name", value:name, onChange: e=>setName(e.target.value) })
        ),
        e("div", { className: "form-row" },
          e("select", { className: "input", value:role, onChange: e=>setRole(e.target.value) },
            e("option", { value:"user" }, "User"),
            e("option", { value:"admin" }, "Admin")
          )
        )
      ),
      e("div", { className: "form-row" },
        e("input", { className: "input", placeholder: "Email", value:email, onChange: e=>setEmail(e.target.value) })
      ),
      e("div", { className: "form-row" },
        e("input", { className: "input", placeholder: "Password", type:"password", value:password, onChange: e=>setPassword(e.target.value) })
      ),
      e("div", { style:{display:"flex", justifyContent:"flex-end"} },
        e("button", { className: "btn", type:"submit" }, mode==="login" ? "Login" : "Create account")
      )
    )
  );
}

// App
function App(){
  const [user, setUser] = useState(load(STORAGE_KEYS.CURRENT, null));
  const [polls, setPolls] = useState(load(STORAGE_KEYS.POLLS, []));
  const [votes, setVotes] = useState(load(STORAGE_KEYS.VOTES, []));
  const [filterOpen, setFilterOpen] = useState(true);
  const [editingPoll, setEditingPoll] = useState(null);
  const [, rerender] = useState(0);

  useEffect(()=>{ save(STORAGE_KEYS.POLLS, polls); }, [polls]);
  useEffect(()=>{ save(STORAGE_KEYS.VOTES, votes); }, [votes]);

  function onAuth(u){ setUser(u); }
  function logout(){ localStorage.removeItem(STORAGE_KEYS.CURRENT); setUser(null); }

  // Admin CRUD
  function createOrUpdatePoll(poll){
    if(poll.id){
      // update
      setPolls(prev=>prev.map(p=>p.id===poll.id?poll:p));
    } else {
      poll.id = uid("poll");
      poll.createdAt = new Date().toISOString();
      poll.closed = false;
      poll.options = poll.options.map((o,i)=>({ id: uid("opt"), text:o, votes:0 }));
      setPolls(prev=>[poll, ...prev]);
    }
    setEditingPoll(null);
  }
  function deletePoll(id){
    if(!confirm("Delete poll?")) return;
    setPolls(prev=>prev.filter(p=>p.id!==id));
    setVotes(prev=>prev.filter(v=>v.pollId!==id));
  }
  function toggleClose(id, val){
    setPolls(prev=>prev.map(p=> p.id===id ? {...p, closed: typeof val === "boolean" ? val : !p.closed } : p));
  }

  // Voting
  function canVote(poll){
    if(!user) return false;
    if(poll.closed) return false;
    const hasVoted = votes.some(v=>v.pollId===poll.id && v.userId===user.id);
    return !hasVoted;
  }
  function vote(pollId, optionId){
    const p = polls.find(x=>x.id===pollId);
    if(!p) { alert("Poll not found"); return; }
    if(p.closed || new Date(p.closingDate) <= new Date()){ alert("This poll is closed"); return; }
    const hasVoted = votes.some(v=>v.pollId===pollId && v.userId===user.id);
    if(hasVoted){ alert("You have already voted"); return; }
    // record vote
    const v = { id: uid("vote"), pollId, optionId, userId: user.id, createdAt: new Date().toISOString() };
    setVotes(prev=>[...prev, v]);
    // increment option count (local)
    setPolls(prev=> prev.map(pp=>{
      if(pp.id!==pollId) return pp;
      return {...pp, options: pp.options.map(o=> o.id===optionId ? {...o, votes: (o.votes||0)+1} : o )};
    }));
    alert("Vote recorded. Thank you!");
  }

  // compute displayed polls: if filterOpen true -> show open polls (by closed flag and closingDate)
  function isPollOpen(p){
    if(p.closed) return false;
    if(p.closingDate && new Date(p.closingDate) <= new Date()) return false;
    return true;
  }
  const displayed = polls.filter(p=> filterOpen ? isPollOpen(p) : true).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));

  return e("div", { className: "container" },
    e("div", { className: "header" },
      e("div", { className: "brand" }, "Polls App"),
      e("div", null,
        user ? e("div", { style:{display:"flex", gap:8, alignItems:"center"} },
          e("div", { className:"small meta" }, `${user.name} (${user.role})`),
          e("button", { className:"btn ghost", onClick: logout }, "Logout")
        ) : null
      )
    ),

    e("div", { className: "grid" },
      e("div", null,
        user ? e("div", { className: "card" },
          e("div", { style:{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8} },
            e("div", { style:{fontWeight:700} }, "Available Polls"),
            e("div", { className:"controls" },
              e("label", { className:"small meta" }, e("input", { type:"checkbox", checked:filterOpen, onChange: e=>setFilterOpen(e.target.checked) }), " Show only open")
            )
          ),
          displayed.length===0 ? e("div", { className:"notice" }, "No polls to show.") :
            displayed.map(p=> e("div", { key:p.id, className:"poll-item" },
              e("div", null,
                e("div", { style:{fontWeight:700} }, p.question),
                e("div", { className:"meta" }, `Closes: ${p.closingDate ? new Date(p.closingDate).toLocaleString() : "—"} ${p.closed ? "(Manually closed)" : ""}`)
              ),
              e("div", null,
                user && user.role==="admin" && e("div", { style:{display:"flex", gap:6} },
                  e("button", { className:"btn ghost", onClick: ()=>setEditingPoll(p) }, "Edit"),
                  e("button", { className:"btn ghost", onClick: ()=>toggleClose(p.id) }, p.closed ? "Re-open" : "Close"),
                  e("button", { className:"btn ghost", onClick: ()=>deletePoll(p.id) }, "Delete")
                ),
                user && canVote(p) ? e("button", { className:"btn", onClick: ()=> openPollModal(p, vote) }, "Vote") :
                // show results if poll closed and user has voted
                ( (p.closed || (p.closingDate && new Date(p.closingDate) <= new Date())) && votes.some(v=>v.pollId===p.id && v.userId=== (user?user.id:null)) )
                  ? e("button", { className:"btn", onClick: ()=> openPollModal(p, null) }, "View Results")
                  : e("div", { className:"small meta" }, user ? (p.closed ? "Closed" : "Already voted / login to vote") : "Login to vote")
              )
            ))
        ) : e(Auth, { onAuth })
      ),

      e("div", null,
        e("div", { className: "card" },
          e("div", { style:{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8} },
            e("div", { style:{fontWeight:700} }, "Admin Panel"),
            e("div", null, user && user.role==="admin" ? null : e("div", { className:"small meta" }, "Admin-only features"))
          ),
          user && user.role==="admin" ? e(AdminPanel, { polls, onCreate: ()=>setEditingPoll({}), onCreateOrUpdate: createOrUpdatePoll, onToggle: toggleClose, onDelete: deletePoll }) :
            e("div", { className:"small" }, "Sign in as an admin to create and manage polls. (Seed admin: admin@poll.app / admin123)")
        ),

        e("div", { className: "card", style:{marginTop:12} },
          e("div", { style:{fontWeight:700, marginBottom:8} }, "Recent Activity"),
          e("div", { className:"small meta" }, `Total polls: ${polls.length}`),
          e("div", { className:"small meta" }, `Total votes: ${votes.length}`),
        )
      )
    ),

    e(ModalHost, { editingPoll, setEditingPoll, onSave: createOrUpdatePoll, polls, votes }),

    e("div", { className:"footer" }, "Polls App - 2025")
  );
}

// AdminPanel Component
function AdminPanel({ polls, onCreate, onCreateOrUpdate, onToggle, onDelete }){
  return e("div", null,
    e("div", { className:"small meta" }, "Create and manage polls"),
    e("div", { style:{marginTop:8} },
      e("button", { className:"btn", onClick: onCreate }, "Create new poll")
    ),
    e("div", { style:{marginTop:10} },
      polls.length===0 ? e("div", { className:"notice" }, "No polls yet") :
        polls.slice(0,6).map(p=> e("div", { key:p.id, className:"option" },
          e("div", null, p.question),
          e("div", { style:{display:"flex", gap:6} },
            e("button", { className:"btn ghost", onClick: ()=> onCreateOrUpdate(p) }, "Open"),
            e("button", { className:"btn ghost", onClick: ()=> onToggle(p.id) }, p.closed? "Reopen":"Close"),
            e("button", { className:"btn ghost", onClick: ()=> onDelete(p.id) }, "Delete")
          )
        ))
    )
  );
}

// Modal host for creating/editing polls and showing poll details/results
function ModalHost({ editingPoll, setEditingPoll, onSave, polls, votes }){
  const [visible, setVisible] = useState(false);
  const [poll, setPoll] = useState(null);

  useEffect(()=>{ if(editingPoll !== null){ setVisible(Boolean(editingPoll)); setPoll(editingPoll ? {...editingPoll} : { question:"", options:["",""], closingDate:"" }); } }, [editingPoll]);

  function close(){ setVisible(false); setTimeout(()=> setEditingPoll(null), 200); }

  if(!visible) return null;

  // If poll has id -> it's existing, else it's create
  const isExisting = poll && poll.id;

  if(!poll) return null;

  return ReactDOM.createPortal(
    e("div", { style:{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(2,6,23,0.5)", zIndex:9999 } },
      e("div", { style:{ width:"min(920px,96%)", maxHeight:"90vh", overflowY:"auto" , background:"#fff", padding:16, borderRadius:10 } },
        e("div", { style:{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8} },
          e("div", { style:{fontWeight:700} }, isExisting ? "Poll details / edit" : "Create poll"),
          e("div", null, e("button",{ className:"btn ghost", onClick: close }, "Close"))
        ),
        isExisting ? e(PollDetails, { poll, votes }) : e(PollEditor, { poll, setPoll, onSave: (p)=>{ onSave(p); close(); } })
      )
    ),
    document.body
  );
}

// PollEditor: create or edit poll
function PollEditor({ poll, setPoll, onSave }){
  const [question, setQuestion] = useState(poll.question||"");
  const [options, setOptions] = useState(poll.options && poll.options.length? poll.options.slice() : ["",""]);
  const [closingDate, setClosingDate] = useState(poll.closingDate ? new Date(poll.closingDate).toISOString().slice(0,16) : "");
  const [err, setErr] = useState("");

  function updateOption(i, val){
    const copy = options.slice(); copy[i]=val; setOptions(copy);
  }
  function addOption(){ setOptions(prev=>[...prev, ""]); }
  function removeOption(i){ if(options.length<=2){ setErr("At least two options required"); return; } setOptions(prev=> prev.filter((_,idx)=>idx!==i)); }

  function submit(e){
    e.preventDefault();
    setErr("");
    if(!question.trim()){ setErr("Question cannot be empty"); return; }
    const cleanOpts = options.map(o=>o.trim()).filter(Boolean);
    if(cleanOpts.length < 2){ setErr("Provide at least two non-empty options"); return; }
    const unique = new Set(cleanOpts.map(s=>s.toLowerCase()));
    if(unique.size !== cleanOpts.length){ setErr("Duplicate options are not allowed"); return; }
    const p = {...poll, question: question.trim(), options: cleanOpts, closingDate: closingDate ? new Date(closingDate).toISOString() : ""};
    onSave(p);
  }

  return e("form", { onSubmit: submit },
    err && e("div", { className:"error" }, err),
    e("div", { className:"form-row" }, e("input", { className:"input", placeholder:"Poll question", value:question, onChange: e=>setQuestion(e.target.value) })),
    e("div", null, options.map((opt,i)=> e("div", { key:i, className:"form-row" },
      e("input", { className:"input", placeholder:`Option ${i+1}`, value:options[i], onChange: e=>updateOption(i, e.target.value) }),
      e("button", { type:"button", className:"btn ghost", onClick: ()=>removeOption(i) }, "Remove")
    ))),
    e("div", { style:{display:"flex", gap:8, marginTop:8, alignItems:"center"} },
      e("button", { type:"button", className:"btn", onClick: addOption }, "Add option"),
      e("input", { type:"datetime-local", className:"input", value:closingDate, onChange: e=>setClosingDate(e.target.value) })
    ),
    e("div", { style:{display:"flex", justifyContent:"flex-end", marginTop:10} },
      e("button", { className:"btn", type:"submit" }, "Save poll")
    )
  );
}

// PollDetails: shows options and results (static bar chart)
function PollDetails({ poll, votes }){
  // compute votes per option from votes array
  const counts = {};
  (poll.options || []).forEach(o=> counts[o.id || o] = 0);
  votes.filter(v=>v.pollId===poll.id).forEach(v=>{
    counts[v.optionId] = (counts[v.optionId] || 0) + 1;
  });
  // if poll.options are stored as text in editor, normalize
  const opts = (poll.options || []).map(o=>{
    if(typeof o === "string") return { id: o, text: o, votes: counts[o]||0 };
    return { id: o.id, text: o.text, votes: counts[o.id] || (o.votes||0) };
  });
  const total = opts.reduce((s,o)=>s+ (o.votes||0), 0);

  return e("div", null,
    e("div", { style:{fontWeight:700, marginBottom:6} }, poll.question),
    e("div", { className:"meta", style:{marginBottom:8} }, `Closes: ${poll.closingDate ? new Date(poll.closingDate).toLocaleString() : "—"}`),
    opts.map(o=> e("div", { key:o.id, className:"option" },
      e("div", null, o.text),
      e("div", { style:{minWidth:160, display:"flex", alignItems:"center"} },
        e("div", { style:{width: Math.max(6, Math.round((o.votes/(total||1))*100)) + "%"}, className:"chart-bar" }),
        e("div", { style:{minWidth:78, textAlign:"right", marginLeft:8} }, `${o.votes} votes`)
      )
    )),
    e("div", { style:{marginTop:10} , className:"small meta" }, `Total votes: ${total}`)
  );
}

// Global helper to open modal for voting or viewing results
function openPollModal(poll, voteFn){
  // create a temporary modal mount
  const mount = document.createElement("div");
  document.body.appendChild(mount);
  function close(){
    ReactDOM.unmountComponentAtNode(mount);
    mount.remove();
  }
  function ModalInner(){
    const [selected, setSelected] = React.useState(null);
    const [votes, setVotes] = React.useState(load(STORAGE_KEYS.VOTES, []));
    const [polls, setPolls] = React.useState(load(STORAGE_KEYS.POLLS, []));
    function doVote(){
      if(!selected){ alert("Choose an option"); return; }
      try{
        voteFn(poll.id, selected);
        setVotes(load(STORAGE_KEYS.VOTES, []));
        setPolls(load(STORAGE_KEYS.POLLS, []));
      }catch(e){ console.error(e); alert("Failed to vote"); }
    }
    const hasVoted = load(STORAGE_KEYS.CURRENT, null) ? votes.some(v=>v.pollId===poll.id && v.userId=== load(STORAGE_KEYS.CURRENT).id) : false;
    const isClosed = poll.closed || (poll.closingDate && new Date(poll.closingDate) <= new Date());
    return e("div", { style:{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(2,6,23,0.5)", zIndex:9999 } },
      e("div", { style:{ width:"min(760px,96%)", background:"#fff", padding:16, borderRadius:10 } },
        e("div", { style:{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8} },
          e("div", { style:{fontWeight:700} }, poll.question),
          e("div", null, e("button",{ className:"btn ghost", onClick: close }, "Close"))
        ),
        !isClosed && !hasVoted ? e("div", null,
          (poll.options||[]).map(o=> {
            const id = typeof o === "string" ? o : o.id;
            const text = typeof o === "string" ? o : o.text;
            return e("div", { key:id, className:"option" },
              e("div", { style:{display:"flex", alignItems:"center", gap:8} },
                e("input", { type:"radio", name:"opt", onChange: ()=>setSelected(id) }),
                e("div", null, text)
              )
            );
          }),
          e("div", { style:{display:"flex", justifyContent:"flex-end", marginTop:8} },
            e("button", { className:"btn", onClick: doVote }, "Submit Vote")
          )
        ) : e("div", null,
          e(PollDetails, { poll, votes })
        )
      )
    );
  }
  ReactDOM.render(e(ModalInner), mount);
}

// Render
ReactDOM.render(React.createElement(App), document.getElementById("root"));
