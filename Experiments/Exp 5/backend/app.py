"""Optional AeroNova sample API. Install Flask, then run python app.py."""
from flask import Flask, jsonify, request
app=Flask(__name__)
FLIGHTS=[{"id":"AN501","code":"AN 501","from":"Chennai","to":"Bengaluru","depart":"08:15","arrive":"09:25","price":2490,"seats":18},{"id":"AN208","code":"AN 208","from":"Chennai","to":"Mumbai","depart":"10:40","arrive":"12:50","price":4890,"seats":9},{"id":"AN714","code":"AN 714","from":"Chennai","to":"Singapore","depart":"22:10","arrive":"05:30","price":12490,"seats":12}]
@app.get("/api/health")
def health(): return jsonify({"status":"ok","service":"AeroNova demo API"})
@app.get("/api/flights")
def flights():
 origin=request.args.get("from"); dest=request.args.get("to"); out=FLIGHTS
 if origin: out=[x for x in out if x["from"].lower()==origin.lower()]
 if dest: out=[x for x in out if x["to"].lower()==dest.lower()]
 return jsonify({"count":len(out),"flights":out})
if __name__=="__main__": app.run(debug=True,port=5000)
