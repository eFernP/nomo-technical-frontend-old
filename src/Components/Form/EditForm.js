import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";

import "./Form.css";

import { putRequest } from "Api/requestFunctions";
import { updateMetric } from "Api/routes";
import { checkDateFormat } from "Functions/dates";

const FormSchema = Yup.object().shape({
  metricName: Yup.string().required("A name is required"),
  metricValue: Yup.number()
    .typeError("The value must be a number")
    .required("A value is required"),
  time: Yup.date().typeError("Must be a date").required("A date is required"),
});

const EditForm = ({ metric, closeModal }) => {
  const [dateError, setDateError] = useState("");

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    let separator = "/";
    if (!values.time.includes("/")) {
      separator = "-";
    }
    const day = values.time.split(separator)[0];
    const month = values.time.split(separator)[1];
    const yearAndTime = values.time.split(separator)[2];
    const finalDate = `${month}-${day}-${yearAndTime}`;
    const timestamp = new Date(finalDate).getTime();

    const body = {
      id: metric.id,
      name: values.metricName,
      value: values.metricValue,
      timestamp,
    };

    try {
      await putRequest(updateMetric, body);
      setSubmitting(false);
      resetForm({ values: "" });
      closeModal(true);
    } catch (error) {
      setSubmitting(false);
      resetForm({ values: "" });
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else alert(error);
    }
  };

  const checkDateError = (d) => {
    if (d === "") {
      setDateError("Date is required.");
      return true;
    } else if (!checkDateFormat(d)) {
      setDateError(
        "Provide a valid date in format DD/MM/YYYY HH:MM:SS, including leading zero."
      );
      return true;
    } else {
      setDateError("");
      return false;
    }
  };

  return (
    <div className="Container">
      <Formik
        initialValues={{
          metricName: metric.name,
          metricValue: metric.value,
          time: metric.timestamp,
        }}
        validationSchema={FormSchema}
        onSubmit={onSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          setFieldTouched,
          isSubmitting,
          /* and other goodies */
        }) => (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setFieldTouched("metricName");
              setFieldTouched("metricValue");
              if (!checkDateError(values.time)) {
                handleSubmit();
              }
            }}
            className="Form"
          >
            <input
              className="Input"
              type="text"
              name="metricName"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.metricName}
              placeholder="Name"
            />
            <p className="Error">
              {errors.metricName && touched.metricName && errors.metricName}
            </p>

            <input
              className="Input"
              type="text"
              name="metricValue"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.metricValue}
              placeholder="Value"
            />

            <p className="Error">
              {errors.metricValue && touched.metricValue && errors.metricValue}
            </p>

            <input
              className="Input"
              type="text"
              name="time"
              onChange={(e) => {
                setFieldValue("time", e.target.value);
                checkDateError(e.target.value);
              }}
              onBlur={(e) => {
                setFieldTouched("time", true);
                checkDateError(e.target.value);
              }}
              value={values.time}
              placeholder="DD/MM/YYYY HH:MM:SS"
            />

            <p className="Error">{dateError}</p>

            <button type="submit" disabled={isSubmitting} className="Button">
              Edit
            </button>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default EditForm;
