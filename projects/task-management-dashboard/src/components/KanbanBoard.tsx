import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, Typography, Chip, Avatar, IconButton } from '@mui/material';
import { Add, MoreVert } from '@mui/icons-material';
import { Task, Column } from '../types/Task';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';

interface KanbanBoardProps {
  projectId: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');

  useEffect(() => {
    fetchBoardData();
  }, [projectId]);

  const fetchBoardData = async () => {
    try {
      const [columnsRes, tasksRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/columns`),
        fetch(`/api/projects/${projectId}/tasks`)
      ]);

      const columnsData = await columnsRes.json();
      const tasksData = await tasksRes.json();

      setColumns(columnsData.columns || []);
      setTasks(tasksData.tasks || []);
    } catch (error) {
      console.error('Error fetching board data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Update task position
    const updatedTasks = [...tasks];
    const taskIndex = updatedTasks.findIndex(task => task.id === draggableId);
    
    if (taskIndex !== -1) {
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        columnId: destination.droppableId,
        position: destination.index
      };

      setTasks(updatedTasks);

      // Update on server
      try {
        await fetch(`/api/tasks/${draggableId}/move`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            columnId: destination.droppableId,
            position: destination.index
          })
        });
      } catch (error) {
        console.error('Error updating task position:', error);
        // Revert on error
        fetchBoardData();
      }
    }
  };

  const handleAddTask = (columnId: string) => {
    setSelectedColumn(columnId);
    setAddTaskModalOpen(true);
  };

  const getTasksForColumn = (columnId: string) => {
    return tasks
      .filter(task => task.columnId === columnId)
      .sort((a, b) => a.position - b.position);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-6">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <Card className="h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Typography variant="h6" className="font-semibold">
                        {column.title}
                      </Typography>
                      <Chip 
                        label={getTasksForColumn(column.id).length} 
                        size="small" 
                        color="primary" 
                      />
                    </div>
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[200px] space-y-3 ${
                          snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg' : ''
                        }`}
                      >
                        {getTasksForColumn(column.id).map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={snapshot.isDragging ? 'rotate-2 shadow-lg' : ''}
                              >
                                <TaskCard task={task} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <button
                    onClick={() => handleAddTask(column.id)}
                    className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Add />
                    Add Task
                  </button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </DragDropContext>

      <AddTaskModal
        open={addTaskModalOpen}
        onClose={() => setAddTaskModalOpen(false)}
        columnId={selectedColumn}
        onTaskAdded={fetchBoardData}
      />
    </div>
  );
};

export default KanbanBoard;