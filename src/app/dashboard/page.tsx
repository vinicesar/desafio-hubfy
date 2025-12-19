"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Container,
  Box,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  CardActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";
import {
  taskSchema,
  type Task,
  type TaskFormData,
  type TaskStatus,
} from "@/types/task";
import { PieChart } from "@mui/x-charts";

// paleta fixa para gráfico + chips
const STATUS_COLORS = {
  completed: "#1976d2", // azul
  in_progress: "#ed6c02", // laranja
  pending: "#d32f2f", // vermelho
} as const;

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [chartData, setChartData] = useState<
    { id: number; label: string; value: number }[]
  >([]);

  const { user, logout, getToken, isAuthenticated } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
    },
  });

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  const fetchTasks = async () => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (err) {
      setError("Erro ao carregar tarefas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setChartData([
      {
        id: 0,
        label: "Concluídas",
        value: tasks.filter((task) => task.status === "completed").length,
      },
      {
        id: 1,
        label: "Em Progresso",
        value: tasks.filter((task) => task.status === "in_progress").length,
      },
      {
        id: 2,
        label: "Pendentes",
        value: tasks.filter((task) => task.status === "pending").length,
      },
    ]);
  }, [tasks]);

  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setValue("title", task.title);
      setValue("description", task.description || "");
      setValue("status", task.status);
    } else {
      setEditingTask(null);
      reset();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
    reset();
  };

  const onSubmit = async (data: TaskFormData) => {
    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();
      const url = editingTask ? `/api/tasks/${editingTask.id}` : "/api/tasks";
      const method = editingTask ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const result = await res.json();
      if (result.success) {
        setSuccess(
          editingTask ? "Tarefa atualizada!" : "Tarefa criada com sucesso!"
        );
        handleCloseDialog();
        fetchTasks();
      } else {
        setError(result.message || "Erro ao salvar tarefa");
      }
    } catch (err) {
      setError("Erro ao salvar tarefa");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm("Tem certeza que deseja deletar esta tarefa?")) {
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      if (data.success) {
        setSuccess("Tarefa deletada com sucesso!");
        fetchTasks();
      } else {
        setError(data.message || "Erro ao deletar tarefa");
      }
    } catch (err) {
      setError("Erro ao deletar tarefa");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return "Concluída";
      case "in_progress":
        return "Em Progresso";
      default:
        return "Pendente";
    }
  };

  const filteredTasks =
    filterStatus === "all"
      ? tasks
      : tasks.filter((task) => task.status === filterStatus);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard - {user?.name}
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccess("")}
          >
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nova Tarefa
          </Button>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Filtro</InputLabel>
            <Select
              value={filterStatus}
              label="Filtro"
              onChange={(e) =>
                setFilterStatus(e.target.value as TaskStatus | "all")
              }
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="pending">Pendentes</MenuItem>
              <MenuItem value="in_progress">Em Progresso</MenuItem>
              <MenuItem value="completed">Concluídas</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <PieChart
          sx={{ display: "flex", justifyContent: "start", alignItems: "center" }}
          title="Status das Tarefas"
          series={[{ data: chartData }]}
          width={150}
          height={100}
          colors={[
            STATUS_COLORS.completed,
            STATUS_COLORS.in_progress,
            STATUS_COLORS.pending,
          ]}
        />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredTasks.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6" align="center" color="text.secondary">
                {filterStatus === "all"
                  ? 'Nenhuma tarefa encontrada. Crie uma nova tarefa!'
                  : `Nenhuma tarefa com status "${getStatusLabel(
                    filterStatus as TaskStatus
                  )}"`}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      mb: 1,
                      gap: 1,
                    }}
                  >
                    <Typography variant="h6" component="h2">
                      {task.title}
                    </Typography>
                    <Chip
                      label={getStatusLabel(task.status)}
                      size="small"
                      sx={{
                        backgroundColor:
                          task.status === "completed"
                            ? STATUS_COLORS.completed
                            : task.status === "in_progress"
                              ? STATUS_COLORS.in_progress
                              : STATUS_COLORS.pending,
                        color: "#fff",
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                  {task.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {task.description}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end" }}>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(task)}
                    disabled={actionLoading}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(task.id)}
                    disabled={actionLoading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogTitle>
              {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
            </DialogTitle>
            <DialogContent>
              <TextField
                {...register("title")}
                fullWidth
                label="Título"
                margin="normal"
                error={!!errors.title}
                helperText={errors.title?.message}
                required
              />
              <TextField
                {...register("description")}
                fullWidth
                label="Descrição"
                margin="normal"
                multiline
                rows={3}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  {...register("status")}
                  label="Status"
                  defaultValue="pending"
                >
                  <MenuItem value="pending">Pendente</MenuItem>
                  <MenuItem value="in_progress">Em Progresso</MenuItem>
                  <MenuItem value="completed">Concluída</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancelar</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || actionLoading}
              >
                {isSubmitting || actionLoading
                  ? "Salvando..."
                  : editingTask
                    ? "Atualizar"
                    : "Criar"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </>
  );
}
