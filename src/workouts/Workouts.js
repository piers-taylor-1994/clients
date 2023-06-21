import { useEffect, useState } from "react";
import { AddRoutine, GetExercises } from "./Data";
import './workouts.scss';
import { useNavigate } from "react-router-dom";
import { GetRoutine } from "../routine/Data";

const MuscleGroup = {
    0: "Shoulders",
    1: "Chest",
    2: "Triceps",
    3: "Biceps"
}
Object.freeze(MuscleGroup);

function Workouts(props) {
    const[exercises, setExercises] = useState([]);
    const[selectedExercises, setSelectedExercises] = useState([]);
    
    const storageRoutine = sessionStorage.getItem("routine");

    const navigate = useNavigate();

    useEffect(() => {
        if (JSON.parse(storageRoutine) && JSON.parse(storageRoutine).setList.length > 0) {
            setSelectedExercises(JSON.parse(storageRoutine).setList);
        }
        else GetRoutine().then(routine => {
            if (routine) {
                setSelectedExercises(routine.setList);
            }
        })
    }, [storageRoutine])

    useEffect(() => {
        GetExercises().then(exercises => {
            if (selectedExercises && selectedExercises.length > 0) {
                selectedExercises.forEach(se => {
                    exercises = exercises.filter(ex => ex.exerciseId !== se.exerciseId);
                });
            }
            setExercises(exercises);
        })
    }, [selectedExercises])

    const onCheck = (e, exercise) => {
        if (e.target.checked) {
            setSelectedExercises((se) => {
                return [...se, exercise];
            })
            setExercises(exercises.filter((ex) => ex.exerciseId !== exercise.exerciseId));
        }
        else {
            setExercises((ex) => {
                return [...ex, exercise];
            })
            setSelectedExercises(selectedExercises.filter((ex) => ex.exerciseId !== exercise.exerciseId));
        }
    }

    const row = (exercise) => {
        return (
            <div key={exercise.exerciseId} className="rows">
                <p>{MuscleGroup[exercise.muscleGroup]}</p>
                <p>{exercise.name}</p>
                <p>{exercise.description}</p>
                <input type="checkbox" checked={selectedExercises.includes(exercise)} onChange={(e) => onCheck(e, exercise)}/>
            </div>
        )
    }

    const onSubmit = () => {
        let newArray = [];
        selectedExercises.forEach(exercise => {
            newArray.push(exercise.exerciseId);
        });
        AddRoutine(newArray).then((exercises) => {
            sessionStorage.setItem("routine", JSON.stringify(exercises));
            navigate("/GymFrontend/routine");
        })
    }

    const exercisesDisplay = exercises.map(e => row(e));
    const selectedExercisesDisplay = selectedExercises.map(e => row(e));

    const submit = selectedExercises.length > 0 ? <button onClick={onSubmit}>Submit</button> : <></>;

    return (
        <div className="workouts">
            <h1>Workouts</h1>
            <div className="workouts-container top">
                {exercisesDisplay}
            </div>
            <div className="workouts-container">
                {selectedExercisesDisplay}
            </div>
            {submit}
        </div>
    )
}

export { MuscleGroup, Workouts };