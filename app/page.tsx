"use client";
import React, { useEffect, useState } from "react";
type FieldType = "text" | "number" | "dropdown" | "time" | "date";
interface Field {
  id: number;
  name: string;
  type: FieldType;
  options?: string[]; // 為下拉菜單添加選項
}

// 定義資料行接口，用於保存每一行資料的鍵值對
interface DataRow {
  [key: string]: any;
}

export default function Home() {
  const [rowNumber, setRowNumber] = useState<number>(1);
  const [fields, setFields] = useState<Field[]>([]);
  const [dataRows, setDataRows] = useState<DataRow[]>([]); // 用於填寫資料
  const [tableDatas, setTableDatas] = useState<DataRow[]>([]); // 用於從 datatable.json 加載並顯示的資料
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const fetchData = async () => {
    const res = await fetch("/api/load");
    const data = await res.json();
    setFields(data.fields);
    setRowNumber(data.rowNumber);
  };

  const fetchTableData = async () => {
    const loadRes = await fetch("/api/loadDataTable");
    const tableDatas = await loadRes.json();
    setTableDatas(tableDatas);
  };

  useEffect(() => {
    fetchData();
    fetchTableData();
  }, []);

  // 監聽 rowNumber 的變化，根據其數值動態生成欄位
  useEffect(() => {
    setFields((prevFields) => {
      const newFields = Array.from({ length: rowNumber }).map((_, index) => {
        return (
          prevFields[index] || {
            id: Date.now() + index,
            name: "",
            type: "text" as FieldType,
          }
        );
      });
      return newFields;
    });
  }, [rowNumber]);

  useEffect(() => {
    const initialRow = fields.reduce((acc: Record<string, any>, field) => {
      // 對於下拉選單，可以設置初始值為第一個選項（如果有的話）
      acc[field.name] =
        field.type === "dropdown" && field.options && field.options.length > 0
          ? field.options[0]
          : "";
      return acc;
    }, {});

    // 假設每次只填寫一條數據（即每次生成的表格只有一行）
    setDataRows([initialRow]);
  }, [fields]);

  const handleFieldNameChange = (id: number, name: string) => {
    const newFields = fields?.map((field) => {
      if (field.id === id) {
        return { ...field, name };
      }
      return field;
    });
    setFields(newFields);
  };

  const handleFieldTypeChange = (id: number, type: FieldType) => {
    const newFields = fields?.map((field) => {
      if (field.id === id) {
        return { ...field, type };
      }
      return field;
    });
    setFields(newFields);
  };

  // 處理下拉選項添加
  const handleAddOption = (id: number, option: string) => {
    setFields(
      fields.map((field) => {
        if (field.id === id && field.type === "dropdown") {
          const updatedOptions = field.options
            ? [...field.options, option]
            : [option];
          return { ...field, options: updatedOptions };
        }
        return field;
      })
    );
  };

  // 處理下拉選項更新
  const handleUpdateOption = (
    id: number,
    optionIndex: number,
    option: string
  ) => {
    setFields(
      fields.map((field) => {
        if (field.id === id && field.type === "dropdown") {
          const updatedOptions = field.options ? [...field.options] : [];
          updatedOptions[optionIndex] = option;
          return { ...field, options: updatedOptions };
        }
        return field;
      })
    );
  };

  // 處理下拉選項刪除
  const handleRemoveOption = (fieldId: number, optionIndex: number) => {
    setFields(
      fields.map((field) => {
        if (field.id === fieldId && field.type === "dropdown") {
          const updatedOptions = field.options ? [...field.options] : [];
          updatedOptions.splice(optionIndex, 1); // 刪除特定索引的選項
          return { ...field, options: updatedOptions };
        }
        return field;
      })
    );
  };

  // 提交欄位設定表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    const res = await fetch("/api/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields, rowNumber }),
    });
    const data = await res.json();
    console.log(data);
    setTimeout(() => setIsSubmitted(false), 3000); // 3秒後清除提交狀態
  };

  // 處理欄位值變化的函數
  const handleFieldChange = (fieldName: string, value: any) => {
    // 假設每次只填寫一條數據（即每次生成的表格只有一行）
    const newData = { ...dataRows[0], [fieldName]: value };
    setDataRows([newData]);
  };

  // 生成 DataTable 並加載顯示
  const generateDataTable = async (e: React.FormEvent) => {
    e.preventDefault(); // 防止表單提交的默認行為
    
    const updatedTableDatas = [...tableDatas, ...dataRows];

    // 將填寫的資料發送到後端以生成 datatable.json
    const saveRes = await fetch("/api/saveDataTable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTableDatas),
    });

    if (saveRes.ok) {
      // 從後端加載 datatable.json 以更新表格顯示
      const loadRes = await fetch("/api/loadDataTable");
      const tableDatas = await loadRes.json();
      setTableDatas(tableDatas);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-4">
      <form
        onSubmit={handleSubmit}
        className="z-10 max-w-5xl w-full flex-col justify-start items-start gap-8 font-mono text-sm lg:flex"
      >
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-center justify-center lg:static lg:h-auto lg:w-auto lg:bg-none">
          新增欄位數量:{" "}
          <input
            type="number"
            className="ml-4 w-20 h-10 text-center"
            value={rowNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRowNumber(parseInt(e.target.value) || 1)
            }
          />
        </div>
        {fields?.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <input
                type="text"
                className="w-40 h-10"
                placeholder="欄位名稱"
                value={field.name}
                onChange={(e) =>
                  handleFieldNameChange(field.id, e.target.value)
                }
              />
              <select
                className="w-40 h-10"
                value={field.type}
                onChange={(e) =>
                  handleFieldTypeChange(field.id, e.target.value as FieldType)
                }
              >
                <option value="text">文字</option>
                <option value="number">數字</option>
                <option value="dropdown">下拉</option>
                <option value="time">時間</option>
                <option value="date">日期</option>
              </select>
            </div>
            {field.type === "dropdown" && (
              <div className="flex flex-wrap gap-4">
                {field.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <input
                      type="text"
                      className="w-40 h-10"
                      value={option}
                      placeholder={`選項 ${optionIndex + 1}`}
                      onChange={(e) =>
                        handleUpdateOption(
                          field.id,
                          optionIndex,
                          e.target.value
                        )
                      }
                    />
                    <button
                      type="button"
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                      onClick={() => handleRemoveOption(field.id, optionIndex)}
                    >
                      刪除
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className=" bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                  onClick={() => handleAddOption(field.id, "")}
                >
                  添加選項
                </button>
              </div>
            )}
          </div>
        ))}
        <button
          type="submit"
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
        >
          更改欄位設定
        </button>
        {isSubmitted && <p className="mt-2 text-green-500">設定已更改！</p>}
      </form>
      <form
        onSubmit={generateDataTable}
        className="mt-10 z-10 max-w-5xl w-full flex justify-start items-center gap-8 font-mono text-sm lg:flex"
      >
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-4">
            <label>{field.name}</label>
            {field.type === "dropdown" ? (
              <select
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                {field.options?.map((option, i) => (
                  <option key={i} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === "time" ? (
              <input
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className="w-full px-2 py-2 border rounded-md"
              />
            ) : (
              <input
                type={field.type}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          生成資料表
        </button>
      </form>
      {tableDatas.length > 0 && (
        <table className="mt-10 max-w-5xl w-full text-left border-collapse">
          <thead className="bg-gray-200">
            <tr>
              {Object.keys(tableDatas[0]).map((key) => (
                <th key={key} className="p-4 border-b-2">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableDatas.map((tableData, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}
              >
                {Object.values(tableData).map((value, valueIndex) => (
                  <td key={valueIndex} className="p-4 border-b">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
