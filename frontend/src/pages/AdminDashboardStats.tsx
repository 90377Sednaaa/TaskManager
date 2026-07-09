import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Stack,
  Avatar,
  Chip,
  LinearProgress,
  Divider,
  Button,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { getTasks, getUsers } from "../api/tasks";
import type { Task, User } from "../types";

function stringToColor(name: string) {
  const colors = [
    "#1976d2",
    "#2e7d32",
    "#d32f2f",
    "#f9a825",
    "#7b1fa2",
    "#0288d1",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
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

const statusHex: Record<string, string> = {
  pending: "#f9a825",
  in_progress: "#0288d1",
  halted: "#d32f2f",
  completed: "#2e7d32",
};

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.2, sm: 3 },
        borderRadius: 2,
        border: `1px solid ${color}22`,
        background: `linear-gradient(135deg, ${color}12 0%, rgba(255,255,255,0.94) 100%)`,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
        minHeight: 116,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 1, fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>
        {value}
      </Typography>
    </Paper>
  );
}

interface AdminDashboardStatsProps {
  onViewAllTasks?: () => void;
}

function AdminDashboardStats({ onViewAllTasks }: AdminDashboardStatsProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTasks(), getUsers()]).then(([taskData, userData]) => {
      setTasks(taskData);
      setEmployees(userData);
      setLoading(false);
    });
  }, []);

  if (loading) return <Typography>Loading...</Typography>;

  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const halted = tasks.filter((t) => t.status === "halted").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const completionRate =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
    .slice(0, 5);

  const workload = employees.map((emp) => {
    const assigned = tasks.filter((t) => t.users.some((u) => u.id === emp.id));
    const activeCount = assigned.filter((t) => t.status !== "completed").length;
    return {
      name: emp.name.split(" ")[0],
      employee: emp,
      total: assigned.length,
      active: activeCount,
    };
  });

  const pieData = [
    { name: "Pending", value: pending, key: "pending" },
    { name: "In progress", value: inProgress, key: "in_progress" },
    { name: "Halted", value: halted, key: "halted" },
    { name: "Completed", value: completed, key: "completed" },
  ].filter((d) => d.value > 0);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const todayLabel = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
  const adminName =
    employees.find((user) => user.id === tasks[0]?.created_by)?.name || "Admin";

  return (
    <Box
      sx={{
        minHeight: "100%",
      }}
    >
      <Box>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 3,
            borderRadius: 2,
            border: "1px solid rgba(15, 23, 42, 0.06)",
            background: "white",
            boxShadow: "0 14px 34px rgba(15, 23, 42, 0.04)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
            }}
          >
            <Box>
              <Stack
                direction="row"
                sx={{ alignItems: "center", spacing: 1, mb: 1.2 }}
              >
                <Chip
                  label="Operations overview"
                  size="small"
                  sx={{
                    bgcolor: "rgba(25,118,210,0.12)",
                    color: "primary.main",
                    fontWeight: 700,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {todayLabel}
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.8 }}>
                {greeting}, {adminName}
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 620 }}>
                {total === 0
                  ? "No tasks yet — create your first one to get started."
                  : `${inProgress + pending} task${inProgress + pending === 1 ? "" : "s"} need attention across ${employees.length} employee${employees.length === 1 ? "" : "s"}.`}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: "wrap", gap: 1 }}
            >
              {onViewAllTasks && (
                <Button
                  variant="outlined"
                  onClick={onViewAllTasks}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  View all tasks
                </Button>
              )}
              <Chip
                label={`${completed}/${total} completed`}
                color="success"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label={`${inProgress + pending} need attention`}
                color="warning"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Stack>
          </Stack>
        </Paper>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard label="Total tasks" value={total} color="#1976d2" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard label="Pending" value={pending} color="#f9a825" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard label="In progress" value={inProgress} color="#0288d1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard label="Halted" value={halted} color="#d32f2f" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard label="Completed" value={completed} color="#2e7d32" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 12px 35px rgba(15, 23, 42, 0.04)",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Status breakdown
            </Typography>
            {total === 0 ? (
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{ py: 4, textAlign: "center" }}
              >
                No data yet
              </Typography>
            ) : (
              <>
                <Box sx={{ width: "100%", height: 210 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={48}
                        outerRadius={78}
                        paddingAngle={2}
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.key} fill={statusHex[entry.key]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Stack
                  direction="row"
                  sx={{
                    flexWrap: "wrap",
                    gap: 1,
                    justifyContent: "center",
                    mt: 1,
                  }}
                >
                  {pieData.map((entry) => (
                    <Chip
                      key={entry.key}
                      size="small"
                      label={`${entry.name} (${entry.value})`}
                      sx={{
                        bgcolor: statusHex[entry.key],
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Stack>
              </>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 12px 35px rgba(15, 23, 42, 0.04)",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Active tasks per employee
            </Typography>
            {workload.length === 0 ? (
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{ py: 4, textAlign: "center" }}
              >
                No employees found
              </Typography>
            ) : (
              <Box sx={{ width: "100%", height: 230 }}>
                <ResponsiveContainer>
                  <BarChart data={workload}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <Tooltip />
                    <Bar
                      dataKey="active"
                      fill="#1976d2"
                      radius={[4, 4, 0, 0]}
                      name="Active tasks"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 12px 35px rgba(15, 23, 42, 0.04)",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Overall completion rate
            </Typography>
            <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={completionRate}
                  sx={{ height: 10, borderRadius: 999 }}
                  color={completionRate === 100 ? "success" : "primary"}
                />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {completionRate}%
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              {completed} of {total} tasks completed
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 12px 35px rgba(15, 23, 42, 0.04)",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Recent activity
            </Typography>
            {recentTasks.length === 0 && (
              <Typography variant="body2" color="text.disabled">
                No tasks yet.
              </Typography>
            )}
            <Stack divider={<Divider />} spacing={1.5}>
              {recentTasks.map((task) => (
                <Stack
                  key={task.id}
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 0.5,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {task.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Updated {new Date(task.updated_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={statusLabel[task.status]}
                    color={statusColor[task.status]}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 12px 35px rgba(15, 23, 42, 0.04)",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Team workload
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {workload.map(({ employee, total: empTotal, active }) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={employee.id}>
                  <Stack
                    direction="row"
                    sx={{ alignItems: "center", gap: 1.5 }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: stringToColor(employee.name),
                        width: 38,
                        height: 38,
                        fontSize: 13,
                      }}
                    >
                      {initials(employee.name)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                        noWrap
                      >
                        {employee.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {active} active &middot; {empTotal} total
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              ))}
              {workload.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.disabled"
                  sx={{ ml: 2 }}
                >
                  No employees found.
                </Typography>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminDashboardStats;
