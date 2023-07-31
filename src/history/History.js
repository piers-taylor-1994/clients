import { useEffect, useRef, useState } from "react";
import { GetRoutineHistory, GetRoutinesHistory } from "./Data";
import "./history.scss"
import { Format } from "../layout/dates";
import { useParams } from "react-router-dom";
import { Loader } from "../layout/Layout";
import * as Icon from "../layout/Icons";

function WorkoutsHistory(props) {
    const [history, setHistory] = useState([]);

    const [historyMonth, setHistoryMonth] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(0);

    const [routineList, setRoutineList] = useState([]);
    const [routineListDate, setRoutineListDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [sectionLoading, setSectionLoading] = useState(false);

    const touchStart = useRef(null);
    const touchEnd = useRef(null);
    const minSwipeDistance = 100;

    const historyId = useParams().id;

    const getRoutine = (id) => {
        setSectionLoading(true);
        GetRoutineHistory(id).then((r) => {
            setRoutineList(r.setList);
            setSectionLoading(false);
        })
    }

    useEffect(() => {
        GetRoutinesHistory().then((history) => {
            setHistory(history);
            let dateArray = new Set();
            history.forEach(h => {
                dateArray.add(Format(h.date).monthYear);
            });
            setHistoryMonth(Array.from(dateArray));
            setLoading(false);
        })
    }, [])

    useEffect(() => {
        if (historyId) {
            getRoutine(historyId);
            setRoutineListDate(new Date());
        }
    }, [historyId])

    const filterHistoryByMonth = () => {
        return history.filter(h => Format(h.date).monthYear === historyMonth[currentMonth]);
    }

    const toSquare = (routine) => {
        const onSquareClick = () => {
            getRoutine(routine.id);
            setRoutineListDate(routine.date);
        }

        return (
            <div className="square" key={routine.id} onClick={onSquareClick}>
                {Format(routine.date).date}
            </div>
        )
    }

    const options = filterHistoryByMonth().reverse().map((routine) => toSquare(routine));

    const row = (exercise) => {
        return (
            <div key={exercise.exerciseId} className="row">
                <span className="exercise-name">{exercise.name}</span>
                <div className="sets">
                    <span>{exercise.weight}kg</span>
                    <span>{exercise.sets} sets</span>
                    <span>{exercise.reps} reps</span>
                </div>
            </div>
        )
    }

    const rows = routineList.map(ex => row(ex));

    const HistorySquares = (props) => {
        var months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        const formatDate = (date) => {
            let month = date.substring(1, 2);
            month = months[month - 1];

            return month + " " + date.substring(2);
        }

        const onTouchStart = (e) => {
            touchStart.current = null;
            touchStart.current = e.targetTouches[0].clientX;
        }

        const onTouchMove = (e) => {
            touchEnd.current = e.targetTouches[0].clientX;
        }

        const onTouchEnd = (e) => {
            if (!touchStart || !touchEnd) return
            const distance = touchStart.current - touchEnd.current;
            const isLeftSwipe = distance > minSwipeDistance
            const isRightSwipe = distance < -minSwipeDistance
            if (isLeftSwipe || isRightSwipe) {
                if (isLeftSwipe && currentMonth + 1 !== historyMonth.length) setCurrentMonth((c) => { return (c + 1) });
                else if (isRightSwipe && currentMonth) setCurrentMonth((c) => { return (c - 1) });
            }
        }

        return (
            <div className="history-squares" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                <h1>History</h1>
                {historyMonth.length > 1 ? <span className="blurb">Swipe to change month</span> : <></>}
                <h2>{formatDate(historyMonth[currentMonth])} ({filterHistoryByMonth().length})</h2>
                <div className="squares-container">
                    {options}
                    <div className="arrows-container">
                        {currentMonth ? <div id="left"><Icon.LeftArrow /></div> : <></>}
                        {currentMonth + 1 !== historyMonth.length ? <div id="right"><Icon.RightArrow /></div> : <></>}
                    </div>
                </div>
            </div>
        )
    }

    const HistorySets = (props) => {
        if (sectionLoading) return (
            <Loader />
        )

        else {
            return (
                <div className="history-sets">
                    <h1>{Format(routineListDate).dayYearShorter}</h1>
                    {rows}
                </div>
            )
        }
    }

    const display = routineList.length === 0 ? <HistorySquares /> : <HistorySets />;
    const backButton = routineList.length !== 0
        ? <div id="back-container" onClick={() => setRoutineList([])}>
            <Icon.Back />
        </div>
        : <></>

    return (
        <div className="history content">
            {backButton}
            {loading ? <Loader /> : display}
        </div>
    )
}

export default WorkoutsHistory;