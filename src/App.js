import React, { useState, useMemo } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "react-flow-renderer";
import "./App.css";
import { Node } from "./components/Node";

function App() {
  //to są dane zbierane z inputów
  const [items, setItems] = useState([
    { action: "", time: "", sequenceOfEvents: "" },
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState();
  const [edges, setEdges, onEdgesChange] = useEdgesState();
  const [criticalPath, setCriticalPath] = useState([]);
  const [time, setTime] = useState(0);

  const nodeTypes = useMemo(() => ({ special: Node }), []);

  const onGenerateGraph = () => {
    setTime(0);
    setCriticalPath([]);

    let eventsLocal = [];
    let actionsLocal = [];
    let max = 0;

    for (let i = 0; i < items.length; i++) {
      let next = items[i].sequenceOfEvents.split("-")[1];
      if (next > max) max = next;
    }

    for (let i = 0; i < max; i++) {
      const event = {
        id: (i + 1).toString(),
        data: i + 1,
        earliest: 0,
        latest: 0,
        stock: 0,
        position: {
          x: i * 100,
          y: i * 100,
        },
        style: {
          width: "60px",
          height: "60px",
          borderRadius: "30px",
        },
      };
      eventsLocal.push(event);
    }

    actionsLocal = items.map((item, i) => {
      let events = items[i].sequenceOfEvents.split("-");
      return {
        id: events[0] + events[1],
        source: events[0],
        target: events[1],
        duration: item.time,
        label: item.action + item.time,
        className: "normal-edge",
        style: { stroke: "black" },
        markerEnd: {
          type: MarkerType.Arrow,
          width: "30px",
          height: "30px",
          color: "black",
        },
      };
    });

    //najw czas dla node
    eventsLocal.forEach((event, i, eventsArray) => {
      if (i === 0) return;

      let temp = 0;
      actionsLocal.forEach((action) => {
        if (action.target === event.id) {
          if (
            Number(eventsLocal[action.source - 1].earliest) +
              Number(action.duration) >
            temp
          ) {
            temp =
              Number(eventsLocal[action.source - 1].earliest) +
              Number(action.duration);
          }
        }
      });
      eventsArray[i].earliest = temp;
    });

    //najp czas dla node
    let index = 0;
    for (let i = eventsLocal.length - 1; i >= 0; i--) {
      if (i === eventsLocal.length - 1 || i === 0) {
        eventsLocal[i].latest = eventsLocal[i].earliest;
      } else {
        index = 0;
        let temp = {};
        actionsLocal.forEach((action) => {
          if (Number(action.source) === i + 1) {
            if (index === 0) {
              temp = action;
            } else {
              if (
                Number(eventsLocal[action.target - 1].latest) -
                  Number(action.duration) <
                Number(eventsLocal[temp.target - 1].latest) -
                  Number(temp.duration)
              ) {
                temp = action;
              }
            }
            index++;
          }
        });
        eventsLocal[i].latest =
          Number(eventsLocal[temp.target - 1].latest) - Number(temp.duration);
      }
    }

    //zapas
    eventsLocal.forEach((e) => (e.stock = e.latest - e.earliest));

    //wyznaczenie cp

    for (let i = 0; i < max; i++) {
      if (eventsLocal[i].stock === 0) {
        setCriticalPath((prev) => [...prev, eventsLocal[i].id]);
        eventsLocal[i].style = {
          width: "60px",
          height: "60px",
          borderRadius: "30px",
          color: "red",
          stroke: "red",
          borderColor: "red",
        };

        for (let j = 0; j < actionsLocal.length; j++) {
          if (
            actionsLocal[j].source === eventsLocal[i].id &&
            eventsLocal[actionsLocal[j].target - 1].stock === 0
          ) {
            if (
              eventsLocal[actionsLocal[j].target - 1].earliest -
                Number(actionsLocal[j].duration) ===
              eventsLocal[actionsLocal[j].source - 1].earliest
            ) {
              setTime(
                (prev) => (prev = prev + Number(actionsLocal[j].duration))
              );
              actionsLocal[j].style = { stroke: "red", color: "red" };
              actionsLocal[j].markerEnd = {
                type: MarkerType.Arrow,
                width: "30px",
                height: "30px",
                color: "red",
              };
            }
          }
        }
      }
    }

    //format outputu
    eventsLocal.forEach(
      (e) =>
        (e.data = {
          label: (
            <div className="Node">
              <div>{e.id}</div>
              <div className="Row">
                <div>{e.earliest}</div>
                <div>{e.latest}</div>
              </div>
              <div>{e.stock}</div>
            </div>
          ),
        })
    );

    //     items.map((item) => {
    //       let events = item.sequenceOfEvents.split("-");
    //       events.map((event) => {
    //         let firstNodeExist = false;
    //         let newNode = {
    //           id: event,
    //           data: {
    //             label: event,
    //           },
    //           position: {
    //             x: (Number(event) - 1) * 200,
    //             y: height * 180,
    //           },
    //           style: {
    //             width: "60px",
    //             height: "60px",
    //             borderRadius: "30px",
    //           },
    //         };
    //         if (!nodesLocal.includes((node) => node.id === newNode.id)) {
    //           if (edgesLocal.find((edge) => edge.source === events[0])) {
    //             newNode = {
    //               ...newNode,
    //               position: { x: Number(event) * 200, y: (height + 1) * 180 },
    //             };
    //             nodesLocal.push(newNode);
    //             height++;
    //           } else {
    //             nodesLocal.push(newNode);
    //           }
    //         } else {
    //           firstNodeExist = true;
    //         }
    //       });
    console.log(eventsLocal);
    console.log(actionsLocal);

    setNodes(eventsLocal);
    setEdges(actionsLocal);
  };

  return (
    <div className="App-header">
      <p className="Description">
        Dodaj czynnność wraz z czasem oraz następstwem zdarzeń
      </p>
      <ul>
        {items.map(({ action, sequenceOfEvents, time, id }) => (
          <div className="Inputs-row-wrapper">
            <input
              onChange={(event) => {
                setItems((prev) =>
                  prev.map((item) =>
                    item.id === id
                      ? { ...item, action: event.target.value }
                      : item
                  )
                );
              }}
              value={action}
              className="Input"
              type="text"
              placeholder="czynnność"
              required
            />
            <input
              onChange={(event) => {
                setItems((prev) =>
                  prev.map((item) =>
                    item.id === id
                      ? { ...item, time: event.target.value }
                      : item
                  )
                );
              }}
              value={time}
              className="Input"
              type="text"
              placeholder="czas"
            />
            <input
              onChange={(event) => {
                setItems((prev) =>
                  prev.map((item) =>
                    item.id === id
                      ? { ...item, sequenceOfEvents: event.target.value }
                      : item
                  )
                );
              }}
              value={sequenceOfEvents}
              className="Input"
              type="text"
              placeholder="następstwo zdarzeń"
            />
            <button
              className="Button"
              onClick={() =>
                setItems((prev) => prev.filter((item) => item.id !== id))
              }
            >
              -
            </button>
          </div>
        ))}
      </ul>
      <button
        className="Button"
        onClick={() =>
          setItems((prev) => [
            ...prev,
            {
              action: "",
              time: "",
              sequenceOfEvents: "",
              id: items.length + 1,
            },
          ])
        }
      >
        +
      </button>
      <div className="Spacer" />
      <button onClick={() => onGenerateGraph()} className="Long-button">
        generuj graf
      </button>
      <div className="Spacer" />
      {!!nodes && !!edges && (
        <>
          <p className="Description">
            {`Ściezka krytyczna: ${criticalPath.map((time) => time)}`}
          </p>
          <div className="Spacer" />
          <p className="Description">{`Czas: ${time} s`}</p>
          <div className="Spacer" />
          <div className="Graph-wrapper">
            <ReactFlow
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              nodes={nodes}
              edges={edges}
            >
              <Controls />
              <Background color="#aaa" gap={16} />
            </ReactFlow>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
