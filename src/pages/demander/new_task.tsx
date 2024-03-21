import CreateTask from "@/components/task_manage/create-task";
import { Card } from "antd";

const DemanderNewTask = () => {
  return (
    <div style={{
      backgroundColor: "rgb(31, 193, 221, 0.02)",
      padding: 5
    }}>
      <Card style={{width:"70%",
      left:"50%",
      transform:"translate(-50%,0)",
      padding: 10
    }}
    hoverable
    >
        <CreateTask />
      </Card>
    </div>
  );
};

export default DemanderNewTask;
