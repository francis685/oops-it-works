from flask import Flask, request, jsonify
from pulp import LpProblem, LpMinimize, LpVariable, lpSum, LpStatus

app = Flask(__name__)

@app.route("/optimize", methods=["POST"])
def optimize():
    data = request.get_json()
    nurses = data["nurses"]
    patients = data["patientsToAssign"]

    prob = LpProblem("Nurse_Assignment", LpMinimize)

    # Decision variables
    x = {(n["name"], p): LpVariable(f"{n['name']}_{p}", lowBound=0) for n in nurses for p in patients}

    # Objective: minimize total fatigue cost
    prob += lpSum((100 - n["score"]) * x[(n["name"], p)] for n in nurses for p in patients)

    # Constraint: each patient’s need must be met
    for p in patients:
        prob += lpSum(x[(n["name"], p)] for n in nurses) == patients[p]

    # ✅ NEW constraint: each nurse’s total workload limited
    for n in nurses:
        prob += lpSum(x[(n["name"], p)] for p in patients) <= 10  # <= 10 patients max per nurse (tune this!)

    # Solve
    prob.solve()

    # Build results
    assignments = {
        n["name"]: {p: int(x[(n["name"], p)].value()) for p in patients}
        for n in nurses
    }

    return jsonify({"status": LpStatus[prob.status], "assignments": assignments})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5002, debug=True)
