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

  const nodeTypes = useMemo(() => ({ special: Node }), []);

  const onGenerateGraph = () => {
    //tu te dane z items, czyli obiekt np. {action:"B", time:"6", previousAction:"A"}
    //mają być przetransformowane w edges i nodes z których się rysuje graf

    let nodesLocal = [];
    let edgesLocal = [];
    let height = 0;

    items.map((item) => {
      let events = item.sequenceOfEvents.split("-");
      events.map((event) => {
        let firstNodeExist = false;
        let newNode = {
          id: event,
          data: {
            label: event,
          },
          position: {
            x: (Number(event) - 1) * 200,
            y: height * 180,
          },
          style: {
            width: "60px",
            height: "60px",
            borderRadius: "30px",
          },
        };
        if (!nodesLocal.includes((node) => node.id === newNode.id)) {
          if (edgesLocal.find((edge) => edge.source === events[0])) {
            newNode = {
              ...newNode,
              position: { x: Number(event) * 200, y: (height + 1) * 180 },
            };
            nodesLocal.push(newNode);
            height++;
          } else {
            nodesLocal.push(newNode);
          }
        } else {
          firstNodeExist = true;
        }
      });

      edgesLocal.push({
        id: `${events[0]}-${events[1]}`,
        source: events[0],
        target: events[1],
        label: item.action + item.time,
        className: "normal-edge",
        style: { stroke: "black" },
        markerEnd: {
          type: MarkerType.Arrow,
          width: "30px",
          height: "30px",
          color: "black",
        },
      });
    });

    setNodes(nodesLocal);
    setEdges(edgesLocal);
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
      )}
    </div>
  );
}

export default App;
