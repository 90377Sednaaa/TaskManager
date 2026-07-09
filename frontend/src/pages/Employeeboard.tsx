import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
  Stack,
  Avatar,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Divider,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { getMyTasks, updateTaskStatus, getTaskLogs } from "../api/tasks";
import type { Task, TaskStatus, TaskLog, User } from "../types";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function stringToColor(name: string) {
  const colors = [
    "#1976d2",
    "#2e7d32",
    "#d32f2f",
    "#f9a825",
    "#7b1fa2",
    "#0288d1",
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

const statusColor: Record<
  string,
  "default" | "warning" | "info" | "error" | "success"
> = {
  pending: "warning",
  in_progress: "info",
  halted: "error",
  completed: "success",
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  in_progress: "In progress",
  halted: "Halted",
  completed: "Completed",
};

const taskAccent: Record<string, string> = {
  pending: "#f59e0b",
  in_progress: "#2563eb",
  halted: "#ef4444",
  completed: "#10b981",
};

interface EmployeeBoardProps {
  employees: User[];
  currentUserId: number | "";
  onCurrentUserChange: (id: number) => void;
}

function EmployeeBoard({
  employees,
  currentUserId,
  onCurrentUserChange,
}: EmployeeBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Update dialog state
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [newStatus, setNewStatus] = useState<TaskStatus>("pending");
  const [newProgress, setNewProgress] = useState(0);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);

  const loadMyTasks = (userId: number) => {
    setLoading(true);
    getMyTasks(userId).then((data) => {
      setTasks(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (currentUserId !== "") loadMyTasks(currentUserId);
  }, [currentUserId]);

  const openUpdate = async (task: Task) => {
    setActiveTask(task);
    setNewStatus(task.status);
    setNewProgress(task.progress);
    setNote("");
    const logs = await getTaskLogs(task.id);
    setTaskLogs(logs);
  };

  const closeUpdate = () => {
    setActiveTask(null);
    setTaskLogs([]);
  };

  const quickAction = async (
    task: Task,
    status: TaskStatus,
    progress?: number,
  ) => {
    if (currentUserId === "") return;
    await updateTaskStatus(task.id, {
      user_id: currentUserId,
      status,
      progress: progress ?? task.progress,
    });
    loadMyTasks(currentUserId);
  };

  const submitUpdate = async () => {
    if (!activeTask || currentUserId === "") return;
    setSubmitting(true);
    try {
      await updateTaskStatus(activeTask.id, {
        user_id: currentUserId,
        status: newStatus,
        progress: newProgress,
        note: note.trim() || undefined,
      });
      closeUpdate();
      loadMyTasks(currentUserId);
    } finally {
      setSubmitting(false);
    }
  };

  const currentEmployee = employees.find((e) => e.id === currentUserId);
  const activeCount = tasks.filter((t) => t.status !== "completed").length;

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.4, md: 3 },
          mb: 3,
          borderRadius: 4,
          border: "1px solid rgba(15, 23, 42, 0.06)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: { sm: "center" },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}
            >
              My Work
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.6 }}>
              {currentEmployee
                ? `${activeCount} active task${activeCount === 1 ? "" : "s"} assigned to ${currentEmployee.name}`
                : "Select an employee to view their tasks"}
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Viewing as</InputLabel>
            <Select
              label="Viewing as"
              value={currentUserId}
              onChange={(e) => onCurrentUserChange(e.target.value as number)}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center" }}
                  >
                    <Avatar
                      sx={{
                        width: 22,
                        height: 22,
                        fontSize: 10,
                        bgcolor: stringToColor(emp.name),
                      }}
                    >
                      {initials(emp.name)}
                    </Avatar>
                    <span>{emp.name}</span>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Alert severity="info" sx={{ mt: 2.2, borderRadius: 2 }}>
          No login yet — use this dropdown to simulate being a specific
          employee.
        </Alert>
      </Paper>

      {loading && <Typography>Loading tasks...</Typography>}

      {!loading && tasks.length === 0 && (
        <Typography color="text.disabled">
          No tasks assigned to this employee yet.
        </Typography>
      )}

      <Grid container spacing={3}>
        {tasks.map((task) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={task.id}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Chip
                  label={statusLabel[task.status]}
                  color={statusColor[task.status]}
                  size="small"
                  sx={{ mb: 1.5, fontWeight: 600 }}
                />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700 }}
                  gutterBottom
                >
                  {task.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {task.description || "No description provided."}
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={task.progress}
                  sx={{
                    mb: 0.5,
                    borderRadius: 4,
                    height: 7,
                    bgcolor: "rgba(15, 23, 42, 0.06)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 4,
                      background: `linear-gradient(90deg, ${taskAccent[task.status]}, #60a5fa)`,
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {task.progress}% complete
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flexWrap: "wrap", gap: 1 }}
                >
                  {task.status !== "in_progress" &&
                    task.status !== "completed" && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => quickAction(task, "in_progress")}
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                          px: 1.2,
                        }}
                      >
                        Start
                      </Button>
                    )}
                  {task.status === "in_progress" && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={<PauseIcon />}
                      onClick={() => quickAction(task, "halted")}
                      sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                      Halt
                    </Button>
                  )}
                  {task.status === "halted" && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<HourglassEmptyIcon />}
                      onClick={() => quickAction(task, "in_progress")}
                      sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                      Resume
                    </Button>
                  )}
                  {task.status !== "completed" && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => quickAction(task, "completed", 100)}
                      sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                      Complete
                    </Button>
                  )}
                </Stack>
              </CardContent>

              <Box sx={{ px: 2, pb: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => openUpdate(task)}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Update progress & notes
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Update dialog */}
      <Dialog open={!!activeTask} onClose={closeUpdate} maxWidth="sm" fullWidth>
        {activeTask && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {activeTask.title}
              <IconButton onClick={closeUpdate} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                STATUS
              </Typography>
              <ToggleButtonGroup
                value={newStatus}
                exclusive
                onChange={(_, val) => {
                  if (!val) return;
                  setNewStatus(val);
                  if (val === "completed") setNewProgress(100);
                }}
                sx={{ display: "flex", mt: 1, mb: 3 }}
              >
                <ToggleButton
                  value="pending"
                  sx={{ flex: 1, textTransform: "none" }}
                >
                  Pending
                </ToggleButton>
                <ToggleButton
                  value="in_progress"
                  sx={{ flex: 1, textTransform: "none" }}
                >
                  In progress
                </ToggleButton>
                <ToggleButton
                  value="halted"
                  sx={{ flex: 1, textTransform: "none" }}
                >
                  Halted
                </ToggleButton>
                <ToggleButton
                  value="completed"
                  sx={{ flex: 1, textTransform: "none" }}
                >
                  Completed
                </ToggleButton>
              </ToggleButtonGroup>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                PROGRESS
              </Typography>
              <Box sx={{ px: 1, mt: 1, mb: 1 }}>
                <Slider
                  value={newProgress}
                  onChange={(_, val) => {
                    const v = val as number;
                    setNewProgress(v);
                    if (v === 100) setNewStatus("completed");
                    else if (newStatus === "completed")
                      setNewStatus("in_progress");
                  }}
                  valueLabelDisplay="on"
                  step={5}
                  marks
                  min={0}
                  max={100}
                />
              </Box>

              <TextField
                label="What did you achieve? (optional)"
                fullWidth
                multiline
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Finished the API integration, waiting on design review"
                sx={{ mt: 2, mb: 3 }}
              />

              {taskLogs.length > 0 && (
                <>
                  <Divider sx={{ mb: 2 }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    PREVIOUS UPDATES
                  </Typography>
                  <Stack
                    spacing={1.5}
                    sx={{ mt: 1, maxHeight: 180, overflowY: "auto" }}
                  >
                    {taskLogs.map((log) => (
                      <Box key={log.id}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: "center" }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {log.user.name}
                          </Typography>
                          <Chip
                            label={statusLabel[log.status_snapshot]}
                            size="small"
                            color={statusColor[log.status_snapshot]}
                            sx={{ height: 18, fontSize: 10 }}
                          />
                        </Stack>
                        {log.note && (
                          <Typography variant="body2" color="text.secondary">
                            {log.note}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.disabled">
                          {new Date(log.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeUpdate} sx={{ textTransform: "none" }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={submitUpdate}
                disabled={submitting}
                sx={{ textTransform: "none" }}
              >
                {submitting ? "Saving..." : "Save update"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default EmployeeBoard;
