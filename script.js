const addForm = document.getElementById("add-form");
const list = document.querySelector("#list");
const descriptionInput = document.querySelector("#description");
const removebtn = document.querySelector(".removebtn");
const openbtn = document.getElementById("open");
const donebtn = document.getElementById("done");
const allbtn = document.getElementById("all");
const filterForm = document.getElementById("filter-form");

let state = {
  todos: [],
  filter: "all", // open, done,
};

const savedState = localStorage.getItem("todo-state");
if (savedState) {
  state = JSON.parse(savedState);
}

function renderTodos() {
  localStorage.setItem("todo-state", JSON.stringify(state));

  list.innerHTML = "";

  const filter = state.todos.filter((todo) => {
    if (state.filter === "open") {
      return todo.done === false;
    } else if (state.filter === "done") {
      return todo.done;
    } else {
      return true;
    }
  });

  filter.forEach((todo) => {
    const todoLi = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;

    checkbox.addEventListener("change", () => {
      fetch(`http://localhost:4730/todos/${todo.id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ done: !todo.done }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Fetch didn't work!");
          }
          return response.json();
        })
        .then(() => {
          refresh();
        });
    });

    const todoText = document.createTextNode(todo.description);
    todoLi.append(checkbox, todoText);

    list.appendChild(todoLi);
  });
}

function refresh() {
  fetch("http://localhost:4730/todos")
    .then((res) => res.json())
    .then((todosFromApi) => {
      state.todos = todosFromApi;
      renderTodos();
    });
}

refresh();

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log("Submit");

  const inputText = descriptionInput.value;
  const newDescription = inputText.trim();
  const newTodo = {
    description: newDescription,
    done: false,
  };

  if (
    state.todos.some(
      (todo) => todo.description.toLowerCase() === newDescription.toLowerCase()
    )
  ) {
    return;
  } else {
    fetch("http://localhost:4730/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    })
      .then((res) => res.json())
      .then(() => refresh());
  }

  renderTodos();
  descriptionInput.value = "";
});

allbtn.addEventListener("click", () => {
  state.filter = "all";
  renderTodos();
});

openbtn.addEventListener("click", () => {
  state.filter = "open";
  renderTodos();
});

donebtn.addEventListener("click", () => {
  state.filter = "done";
  renderTodos();
});

removebtn.addEventListener("click", () => {
  state.todos.forEach((todo) => {
    if (todo.done) {
      const url = "http://localhost:4730/todos/" + todo.id;
      fetch(url, {
        method: "DELETE",
      }).then((res) => refresh());
    }
  });
});

renderTodos();
